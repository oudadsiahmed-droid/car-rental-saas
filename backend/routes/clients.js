const express = require('express')
const router = express.Router()
const Client = require('../models/Client')
const auth = require('../middleware/auth')

router.get('/', auth, async (req, res) => {
  const clients = await Client.find({ user: req.userId })
  res.json(clients)
})

router.post('/', auth, async (req, res) => {
  const client = await Client.create({ ...req.body, user: req.userId })
  res.json(client)
})

router.put('/:id', auth, async (req, res) => {
  const client = await Client.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true })
  res.json(client)
})

router.delete('/:id', auth, async (req, res) => {
  await Client.findOneAndDelete({ _id: req.params.id, user: req.userId })
  res.json({ message: 'تم الحذف' })
})

module.exports = router