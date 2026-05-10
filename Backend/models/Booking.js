import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
  {
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expert',
      required: [true, 'Expert ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Booker name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Invalid Indian mobile number'],
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: [true, 'Booking date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'completed'],
        message: 'Status must be pending, confirmed, or completed',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
)

// ─── CRITICAL: compound unique index prevents double booking ───
// Even if two requests arrive simultaneously, MongoDB will reject
// the second insert with error code 11000 (duplicate key).
bookingSchema.index(
  { expertId: 1, date: 1, timeSlot: 1 },
  { unique: true }
)

// Index for fast email-based lookups (My Bookings page)
bookingSchema.index({ email: 1 })

const Booking = mongoose.model('Booking', bookingSchema)
export default Booking
