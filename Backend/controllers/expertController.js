import Expert from '../models/Expert.js'
import { asyncHandler } from '../middleware/errorHandler.js'

// GET /experts?page=1&limit=9&category=&search=
export const getExperts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 9))
  const skip = (page - 1) * limit

  // Build filter
  const filter = {}

  if (req.query.category) {
    filter.category = req.query.category
  }

  if (req.query.search && req.query.search.trim()) {
    // Use regex for partial name matching (works without text index too)
    filter.name = { $regex: req.query.search.trim(), $options: 'i' }
  }

  const [experts, total] = await Promise.all([
    Expert.find(filter)
      .select('-availableSlots') // exclude slots on list view for performance
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Expert.countDocuments(filter),
  ])

  // Add free slot count for each expert without sending all slot data
  const expertsWithSlotCount = await Promise.all(
    experts.map(async (expert) => {
      const full = await Expert.findById(expert._id).select('availableSlots').lean()
      const freeSlots = full?.availableSlots?.filter((s) => !s.isBooked) || []
      return { ...expert, availableSlots: freeSlots }
    })
  )

  res.json({
    success: true,
    experts: expertsWithSlotCount,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
  })
})

// GET /experts/:id
export const getExpertById = asyncHandler(async (req, res) => {
  const expert = await Expert.findById(req.params.id).lean()

  if (!expert) {
    return res.status(404).json({ success: false, message: 'Expert not found' })
  }

  res.json({ success: true, ...expert })
})
