const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, company } = req.body
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'الإيميل موجود بالفعل' })
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashed, company })
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, company: user.company } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'الإيميل غير موجود' })
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).json({ message: 'كلمة السر خاطئة' })
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, company: user.company } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router