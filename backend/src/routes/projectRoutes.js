import { Router } from 'express';

import {
  computeProjectExecution,
  createProject,
  generateInviteToken,
  getUserProjects,
  joinProject,
  simulateProjectExecution,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  authorizeProjectMember,
  authorizeProjectOwner,
  loadProject,
} from '../middleware/projectAuthorizationMiddleware.js';
import {
  validateCreateProject,
  validateJoinProject,
} from '../validators/projectValidators.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(getUserProjects)
  .post(validateCreateProject, createProject);

router.post('/join', validateJoinProject, joinProject);

router.post(
  '/:projectId/compute-execution',
  loadProject,
  authorizeProjectMember,
  computeProjectExecution,
);

router.post(
  '/:projectId/simulate',
  loadProject,
  authorizeProjectMember,
  simulateProjectExecution,
);

router.post(
  '/:projectId/invite-token',
  loadProject,
  authorizeProjectOwner,
  generateInviteToken,
);

router.get('/:projectId', loadProject, authorizeProjectMember, (req, res) => {
  res.status(200).json({
    success: true,
    project: req.project,
  });
});

export default router;
