import { Router } from 'express'
import {
  createBooking,
  getBookingsByEmail,
  updateBookingStatus,
} from '../controllers/bookingController.js'
import {
  validateCreateBooking,
  validateUpdateStatus,
  validateGetBookings,
  validate,
} from '../middleware/validators.js'

const router = Router()

router.post('/', validateCreateBooking, validate, createBooking)
router.get('/', validateGetBookings, validate, getBookingsByEmail)
router.patch('/:id/status', validateUpdateStatus, validate, updateBookingStatus)

export default router
