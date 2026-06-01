const mongoose = require('mongoose')

const contractSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientName: String,
  clientCin: String,
  clientPhone: String,
  clientCity: String,
  carName: String,
  carPlate: String,
  startDate: String,
  endDate: String,
  pricePerDay: Number,
  kmStart: String,
  kmEnd: String,
  status: { type: String, default: 'نشط' },
  signatureClient: String,
  signatureCompany: String,
}, { timestamps: true })

module.exports = mongoose.model('Contract', contractSchema)