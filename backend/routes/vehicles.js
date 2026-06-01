const express = require('express')
const router = express.Router()
const Vehicle = require('../models/Vehicle')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  const vehicles = await Vehicle.find({ user: req.userId })
  res.json(vehicles)
})

router.post('/', auth, async (req, res) => {
  const vehicle = await Vehicle.create({ ...req.body, user: req.userId })
  res.json(vehicle)
})

router.put('/:id', auth, async (req, res) => {
  const vehicle = await Vehicle.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true })
  res.json(vehicle)
})

router.delete('/:id', auth, async (req, res) => {
  await Vehicle.findOneAndDelete({ _id: req.params.id, user: req.userId })
  res.json({ message: 'تم الحذف' })
})

module.exports = router