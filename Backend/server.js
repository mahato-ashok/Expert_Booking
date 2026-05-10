import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { connectDB } from './config/db.js'
import expertRoutes from './routes/expertRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const httpServer = createServer(app)

// ── Socket.io ──────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  console.log(`[Socket] client connected: ${socket.id}`)

  // Client joins a room named after the expert they're viewing
  socket.on('join-expert', (expertId) => {
    if (typeof expertId === 'string' && expertId.length === 24) {
      socket.join(expertId)
      console.log(`[Socket] ${socket.id} joined room: ${expertId}`)
    }
  })

  // Client leaves when they navigate away
  socket.on('leave-expert', (expertId) => {
    socket.leave(expertId)
    console.log(`[Socket] ${socket.id} left room: ${expertId}`)
  })

  socket.on('disconnect', () => {
    console.log(`[Socket] client disconnected: ${socket.id}`)
  })
})

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: false }))

// Attach io to every request so controllers can emit events
app.use((req, _res, next) => {
  req.io = io
  next()
})

// ── Routes ─────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/experts', expertRoutes)
app.use('/bookings', bookingRoutes)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Global error handler (must be last)
app.use(errorHandler)

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  })
})
