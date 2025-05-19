const express = require('express');
const router = express.Router();
const { createProject, getProjects } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware'); // Assuming you'll create this middleware file

router.route('/').post(protect, createProject).get(protect, getProjects);

module.exports = router; 