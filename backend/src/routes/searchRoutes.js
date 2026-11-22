
const express = require('express');
const controller = require('../controllers/searchController');
const authenticate = require('../middleware/authenticate');
const { requirePermission } = require('../middleware/requireRole');

const router = express.Router();

router.get(
  '/applications/search',
  authenticate,
  requirePermission('application:view-all'),
  controller.search,
);

module.exports = router;
