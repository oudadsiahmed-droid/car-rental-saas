const mongoose = require('mongoose')

const clientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  cin: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String },
  cinFront: { type: String },
  cinBack: { type: String },
  permis: { type: String },
  rentals: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Client', clientSchema)