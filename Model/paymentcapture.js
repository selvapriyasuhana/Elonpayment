const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order', // Reference to the Order model
    required: true
  },
  paymentId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  captureDate: {
    type: Date,
    required: true
  },
  paymentSignature: {
    type: String,
    required: true
  },
  
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
