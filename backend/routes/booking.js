const express = require('express')
const router = express.Router()
const Booking = require('../models/Booking')
const auth = require('../middleware/auth')

// جيب كل الحجوزات ديال الشركة
router.get('/', auth, async (req, res) => {
  const bookings = await Booking.find({ company: req.userId }).populate('vehicle')
  res.json(bookings)
})

// تأكيد حجز
router.put('/:id/confirm', auth, async (req, res) => {
  const booking = await Booking.findOneAndUpdate(
    { _id: req.params.id, company: req.userId },
    { status: 'confirmed' },
    { returnDocument: 'after' }
  )
  res.json(booking)
})

// إلغاء حجز
router.put('/:id/cancel', auth, async (req, res) => {
  const booking = await Booking.findOneAndUpdate(
    { _id: req.params.id, company: req.userId },
    { status: 'cancelled' },
    { returnDocument: 'after' }
  )
  res.json(booking)
})

module.exports = router