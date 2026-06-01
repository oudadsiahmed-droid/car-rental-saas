const express = require('express')
const router = express.Router()
const Contract = require('../models/Contract')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  const contracts = await Contract.find({ user: req.userId })
  res.json(contracts)
})

router.post('/', auth, async (req, res) => {
  const contract = await Contract.create({ ...req.body, user: req.userId })
  res.json(contract)
})

router.put('/:id', auth, async (req, res) => {
  const contract = await Contract.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true })
  res.json(contract)
})

router.delete('/:id', auth, async (req, res) => {
  await Contract.findOneAndDelete({ _id: req.params.id, user: req.userId })
  res.json({ message: 'تم الحذف' })
})

module.exports = router