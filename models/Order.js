const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, default: 1 },
  subtotal: { type: Number, required: true }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  userId: { type: String },
  items: { type: [ItemSchema], required: true },
  itemSummary: { type: String },
  total: { type: Number, required: true },
  address: { type: String, default: '' },
  status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
