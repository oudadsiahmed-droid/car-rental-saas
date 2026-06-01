const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const http = require('http')
const { Server } = require('socket.io')

dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.set('io', io)

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId)
  })
})

app.use('/api/auth', require('./routes/auth'))
app.use('/api/vehicles', require('./routes/vehicles'))
app.use('/api/clients', require('./routes/clients'))
app.use('/api/contracts', require('./routes/contracts'))
app.use('/api/superadmin', require('./routes/superadmin'))
app.use('/api/bookings', require('./routes/booking'))
app.use('/api/public', require('./routes/public'))

app.get('/', (req, res) => res.json({ message: 'CarRental Pro API ✅' }))

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB متصل!')
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server شغال على port ${process.env.PORT}`)
    })
  })
  .catch(err => console.log('❌ خطأ:', err))