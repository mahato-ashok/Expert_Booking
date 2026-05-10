import mongoose from 'mongoose'
import Booking from '../models/Booking.js'
import Expert from '../models/Expert.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// POST /bookings
// Uses a MongoDB session + transaction to atomically:
//   1. Verify the slot exists and is not booked
//   2. Mark the slot as booked on the Expert document
//   3. Insert the Booking document
// If step 3 hits a duplicate key (race condition), the whole
// transaction is rolled back and a 409 is returned.
export const createBooking = asyncHandler(async (req, res) => {
  const { expertId, name, email, phone, date, timeSlot, notes } = req.body

  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    // 1. Find the expert and the specific slot atomically
    const expert = await Expert.findOneAndUpdate(
      {
        _id: expertId,
        'availableSlots.date': date,
        'availableSlots.time': timeSlot,
        'availableSlots.isBooked': false, // only update if not already booked
      },
      {
        $set: { 'availableSlots.$.isBooked': true },
      },
      { new: true, session }
    )

    // If expert not found OR slot was already booked, the update returns null
    if (!expert) {
      await session.abortTransaction()
      return res.status(409).json({
        success: false,
        message: 'This time slot is no longer available. Please choose another slot.',
      })
    }

    // 2. Create the booking document inside the same transaction
    const [booking] = await Booking.create(
      [
        {
          expertId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          date,
          timeSlot,
          notes: notes?.trim() || '',
          status: 'pending',
        },
      ],
      { session }
    )

    await session.commitTransaction()

    // 3. Emit real-time event to all users viewing this expert's detail page
    // `req.io` is attached in server.js
    if (req.io) {
      req.io.to(expertId.toString()).emit('slot-booked', {
        expertId: expertId.toString(),
        date,
        timeSlot,
      })
    }

    // 4. Populate expert info on the response
    await booking.populate('expertId', 'name category')

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking,
    })
  } catch (err) {
    await session.abortTransaction()

    // Compound unique index violation — final safety net
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot has already been booked. Please choose another slot.',
      })
    }

    throw err // pass to global error handler
  } finally {
    session.endSession()
  }
})

// GET /bookings?email=user@example.com
export const getBookingsByEmail = asyncHandler(async (req, res) => {
  const email = req.query.email.trim().toLowerCase()

  const bookings = await Booking.find({ email })
    .populate('expertId', 'name category bio rating')
    .sort({ createdAt: -1 })
    .lean()

  res.json({
    success: true,
    bookings,
    total: bookings.length,
  })
})

// PATCH /bookings/:id/status
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate('expertId', 'name category')

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' })
  }

  res.json({
    success: true,
    message: `Booking status updated to "${status}"`,
    booking,
  })
})
