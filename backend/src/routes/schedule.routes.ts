import { Router } from 'express';
import {
  listSchedules, getSchedule, createSchedule,
  updateSchedule, deleteSchedule, getScheduleStats,
} from '../controllers/schedule.controller';
import { authenticate } from '../middleware/auth';
import { validate, createScheduleValidation, updateScheduleValidation, listSchedulesValidation } from '../middleware/validate';

const router = Router();

// All schedule routes require authentication
router.use(authenticate);

router.get('/stats',    getScheduleStats);
router.get('/',         validate(listSchedulesValidation), listSchedules);
router.get('/:id',      getSchedule);
router.post('/',        validate(createScheduleValidation), createSchedule);
router.patch('/:id',    validate(updateScheduleValidation), updateSchedule);
router.delete('/:id',   deleteSchedule);

export default router;
