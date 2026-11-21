const express = require('express');
const controller = require('../controllers/applicationController');
const authenticate = require('../middleware/authenticate');
const { requirePermission } = require('../middleware/requireRole');

const router = express.Router();

router.post('/jobs/:jobId/applications', authenticate, requirePermission('application:submit'), controller.submit);
router.get('/applications', authenticate, requirePermission('application:view-all'), controller.list);
router.get('/applications/:id', authenticate, controller.get);
router.patch(
  '/applications/:id/stage',
  authenticate,
  requirePermission('application:change-stage'),
  controller.changeStage,
);
router.get('/applications/:id/history', authenticate, requirePermission('application:view-history'), controller.history);

module.exports = router;
