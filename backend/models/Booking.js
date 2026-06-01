const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  clientName: { type: String, required: true },
  clientPhone: { type: String, required: true },
  clientEmail: { type: String },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  totalPrice: { type: Number },
  paymentMethod: { type: String, enum: ['online', 'cash'], default: 'cash' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  notes: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('Booking', bookingSchema)