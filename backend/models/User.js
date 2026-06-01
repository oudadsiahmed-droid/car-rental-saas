const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  company: { type: String, default: 'CarRental Pro' },
  phone: { type: String },
  address: { type: String },
  logo: { type: String },
  role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
  lang: { type: String, default: 'ar' },
  subscriptionStatus: { type: String, enum: ['active', 'inactive', 'trial'], default: 'trial' },
  subscriptionPlan: { type: String, enum: ['starter', 'pro', 'enterprise'], default: 'starter' },
  subscriptionEnd: { type: Date, default: () => new Date(+new Date() + 14*24*60*60*1000) },
  vehicleLimit: { type: Number, default: 30 },
  lemonSubscriptionId: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)