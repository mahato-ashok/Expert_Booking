import { Router } from 'express'
import { getExperts, getExpertById } from '../controllers/expertController.js'
import {
  validateGetExperts,
  validateExpertId,
  validate,
} from '../middleware/validators.js'

const router = Router()

router.get('/', validateGetExperts, validate, getExperts)
router.get('/:id', validateExpertId, validate, getExpertById)

export default router
