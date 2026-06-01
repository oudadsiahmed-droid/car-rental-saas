const mongoose = require('mongoose')

const vehicleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  plate: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['متاحة', 'مكتراة', 'صيانة'], default: 'متاحة' },
  image: { type: String },
  visite: { type: Date },
  assurance: { type: Date },
}, { timestamps: true })

module.exports = mongoose.model('Vehicle', vehicleSchema)