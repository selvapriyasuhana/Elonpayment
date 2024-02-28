// model.js
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  receipt: {
    type: String,
    default: 'receipt_order_74394'
  },
  payment_capture: {
    type: Number,
    default: 1
  },
  
  status: {
    type: String,
    default: 'created'
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
