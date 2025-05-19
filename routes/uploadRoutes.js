const express = require('express');
const router = express.Router();
const { createUpload, getUploadsForProject, getUploadById, updateTranscript } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').post(protect, upload.single('file'), createUpload);
router.route('/project/:projectId').get(protect, getUploadsForProject);
router.route('/:uploadId').get(protect, getUploadById);
router.route('/:uploadId/transcript').put(protect, updateTranscript);

module.exports = router;