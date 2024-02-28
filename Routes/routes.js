
const express = require("express");
const router = express.Router();
const Order= require("../Model/paymentmodel.js");
const Payment =require("../Model/paymentcapture.js");
const crypto = require('crypto');
module.exports = function (razorpayInstance) {

router.post('/create-order', async (req, res) => {
    const { amount } = req.body;
    if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: 'receipt_order_74394',
      payment_capture: 1
    };
    console.log('Options:', options);


try {
  const response = await razorpayInstance.orders.create(options); 
   // Create order in database
    const order = new Order({
      amount: amount
    });
    await order.save();
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to create order');
  }
});
  

/*router.post('/capture-payment', async (req, res) => {
    const { payment_id, amount } = req.body;

    try {
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Capture the payment
        const response = await razorpayInstance.payments.capture(payment_id, amount * 100);

        // Update order status in database
        const updatedOrder = await Order.findOneAndUpdate({ receipt: 'receipt_order_74394' }, { status: 'paid' });

        // Create a new payment record in the database
        const payment = new Payment({
            orderId: updatedOrder._id, // Assuming you have an orderId field in your Payment model
            paymentId: payment_id,
            amount: amount,
            captureDate: new Date()
        });
        await payment.save();

        res.json({ success: true, message: 'Payment captured successfully', payment: payment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to capture payment' });
    }
});*/
router.post('/capture-payment', async (req, res) => {
  const body = req.body;
  const signature = req.get('X-Razorpay-Signature'); // Signature provided by Razorpay in the headers
  const secret = '0123456789'; // Your Razorpay webhook secret key

  try {
      // Validate the webhook signature
      const hash = crypto.createHmac('sha256', secret)
                         .update(JSON.stringify(body))
                         .digest('hex');
                         console.log('Received Signature:', signature);
                         console.log('Calculated Hash:', hash);
      if (hash === signature) {
          console.log('Request is legit');
          // Proceed with processing the webhook event
          // Handle the webhook event based on the event type
          switch (body.event) {
              case 'payment.captured':
                  // Handle payment captured event
                  const paymentId = body.payload.payment.entity.id;
                  const orderId = body.payload.payment.entity.order_id;
                  const amount = body.payload.payment.entity.amount / 100; // Convert amount to INR
                  const captureDate = new Date(body.payload.payment.entity.created_at * 1000); // Convert Unix timestamp to Date object

                  // Update order status in database
                  await Order.findOneAndUpdate({ _id: orderId }, { status: 'paid' });

                  // Create a new payment record in the database
                  const payment = new Payment({
                      orderId: orderId,
                      paymentId: paymentId,
                      amount: amount,
                      captureDate: captureDate
                  });
                  await payment.save();

                  console.log('Payment captured successfully:', payment);
                  break;

              // Add more cases to handle other webhook events as needed

              default:
                  console.log('Unhandled event:', body.event);
                  break;
          }

          res.status(200).send('Webhook received successfully');
      } else {
          console.log('Invalid signature');
          res.status(400).send('Invalid signature');
      }
  } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).send('Failed to process webhook');
  }
});


  return router;
};
