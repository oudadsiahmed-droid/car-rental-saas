const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Vehicle = require('../models/Vehicle')
const Booking = require('../models/Booking')

router.get('/company/:slug', async (req, res) => {
  try {
    const company = await User.findOne({ 
      company: { $regex: new RegExp(req.params.slug.replace(/-/g, ' '), 'i') }
    }).select('-password')
    if (!company) return res.status(404).json({ message: 'الشركة غير موجودة' })
    res.json(company)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/company/:slug/vehicles', async (req, res) => {
  try {
    const company = await User.findOne({ 
      company: { $regex: new RegExp(req.params.slug.replace(/-/g, ' '), 'i') }
    })
    if (!company) return res.status(404).json({ message: 'الشركة غير موجودة' })
    const vehicles = await Vehicle.find({ user: company._id, status: 'متاحة' })
    res.json({ company, vehicles })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/company/:slug/book', async (req, res) => {
  try {
    const company = await User.findOne({ 
      company: { $regex: new RegExp(req.params.slug.replace(/-/g, ' '), 'i') }
    })
    if (!company) return res.status(404).json({ message: 'الشركة غير موجودة' })
    
    const { vehicleId, clientName, clientPhone, clientEmail, startDate, endDate, paymentMethod, notes } = req.body
    
    const vehicle = await Vehicle.findById(vehicleId)
    if (!vehicle) return res.status(404).json({ message: 'السيارة غير موجودة' })
    
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
    const totalPrice = days * vehicle.price

    const booking = await Booking.create({
      company: company._id,
      vehicle: vehicleId,
      clientName,
      clientPhone,
      clientEmail,
      startDate,
      endDate,
      pricePerDay: vehicle.price,
      totalPrice,
      paymentMethod,
      notes,
      status: 'pending'
    })

    const io = req.app.get('io')
    if (io) {
      io.to(company._id.toString()).emit('new_booking', {
        title: '🔔 حجز جديد!',
        clientName,
        vehicle: vehicle.name,
        days,
        totalPrice,
        phone: clientPhone
      })
    }

    const waUrl = company.whatsapp
      ? `https://wa.me/${company.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`🚗 حجز جديد!\n👤 ${clientName}\n📞 ${clientPhone}\n🚘 ${vehicle.name}\n📅 ${startDate} → ${endDate}\n💰 ${totalPrice} MAD`)}`
      : null

    res.json({ booking, totalPrice, days, waUrl })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router