import { Router } from 'express';
import {
  listRoutines, getRoutine, createRoutine, updateRoutine, deleteRoutine,
  getTodayRoutines, logRoutine, getRoutineAnalytics, getRoutinesOverview,
} from '../controllers/routine.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/today',          getTodayRoutines);
router.get('/overview',       getRoutinesOverview);
router.get('/',               listRoutines);
router.get('/:id',            getRoutine);
router.post('/',              createRoutine);
router.patch('/:id',          updateRoutine);
router.delete('/:id',         deleteRoutine);
router.post('/:id/log',       logRoutine);
router.get('/:id/analytics',  getRoutineAnalytics);

export default router;
