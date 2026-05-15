import { Router } from 'express';

import {
  createTask,
  deleteTask,
  getProjectTasks,
  getTaskHistory,
  updateTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateProjectIdParam,
  validateCreateTask,
  validateTaskIdParam,
  validateUpdateTask,
} from '../validators/taskValidators.js';

const router = Router();

router.use(protect);

router.post('/', validateCreateTask, createTask);
router.get('/:id/history', validateTaskIdParam, getTaskHistory);
router.put('/:id', validateTaskIdParam, validateUpdateTask, updateTask);
router.delete('/:id', validateTaskIdParam, deleteTask);
router.get('/project/:projectId', validateProjectIdParam, getProjectTasks);

export default router;
