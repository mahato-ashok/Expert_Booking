import mongoose from 'mongoose'

const slotSchema = new mongoose.Schema(
  {
    date: {
      type: String, // stored as 'YYYY-MM-DD'
      required: true,
    },
    time: {
      type: String, // e.g. '10:00 AM'
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
)

const expertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Expert name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Technology', 'Business', 'Design', 'Health', 'Education', 'Marketing', 'Finance', 'Legal'],
        message: 'Invalid category',
      },
    },
    experience: {
      type: Number,
      required: [true, 'Experience is required'],
      min: [0, 'Experience cannot be negative'],
      max: [60, 'Experience cannot exceed 60 years'],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
    },
    photo: {
      type: String,
      default: '',
    },
    availableSlots: {
      type: [slotSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// Text index for search by name
expertSchema.index({ name: 'text' })
expertSchema.index({ category: 1 })

const Expert = mongoose.model('Expert', expertSchema)
export default Expert
