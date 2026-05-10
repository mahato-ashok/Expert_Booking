export function errorHandler(err, req, res, next) {
  // Log in dev
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${req.method} ${req.url}]`, err.message)
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ success: false, message: messages.join('. ') })
  }

  // Mongoose duplicate key — double booking
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'This time slot has already been booked. Please choose another slot.',
    })
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' })
  }

  // Default
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  })
}

// Async wrapper — eliminates try/catch in every controller
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
