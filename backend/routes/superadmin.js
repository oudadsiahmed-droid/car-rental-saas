const express = require('express')
const router = express.Router()
const User = require('../models/User')
const auth = require('../middleware/auth')

const isSuperAdmin = async (req, res, next) => {
  const user = await User.findById(req.userId)
  if (!user || user.role !== 'superadmin') return res.status(403).json({ message: 'غير مصرح' })
  next()
}

router.get('/companies', auth, isSuperAdmin, async (req, res) => {
  const companies = await User.find({ role: 'admin' }).select('-password')
  res.json(companies)
})

router.put('/companies/:id/activate', auth, isSuperAdmin, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, {
    subscriptionStatus: 'active',
    subscriptionEnd: new Date(+new Date() + 30*24*60*60*1000)
  }, { new: true }).select('-password')
  res.json(user)
})

router.put('/companies/:id/deactivate', auth, isSuperAdmin, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, {
    subscriptionStatus: 'inactive'
  }, { new: true }).select('-password')
  res.json(user)
})

router.put('/companies/:id/plan', auth, isSuperAdmin, async (req, res) => {
  const { plan } = req.body
  const limits = { starter: 30, pro: 100, enterprise: 999999 }
  const user = await User.findByIdAndUpdate(req.params.id, {
    subscriptionPlan: plan,
    vehicleLimit: limits[plan]
  }, { new: true }).select('-password')
  res.json(user)
})

router.delete('/companies/:id', auth, isSuperAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id)
  res.json({ message: 'تم الحذف' })
})

module.exports = router