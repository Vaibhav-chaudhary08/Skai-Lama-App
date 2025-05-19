const Upload = require('../models/Upload');
const Project = require('../models/Project');
const fs = require('fs'); // Required for file deletion
const path = require('path'); // Required for path manipulation
// const multer = require('multer'); // Multer is used in middleware
// const path = require('path'); // Path is used in middleware

// @desc    Create a new upload for a project
// @route   POST /api/uploads
// @access  Private
const createUpload = async (req, res) => {
  const { project: projectId, type, name, transcript, rssUrl, youtubeUrl } = req.body;

  // For file uploads, the file path is available in req.file.path
  const filePath = req.file ? req.file.path : undefined;

  try {
    // Check if the project exists and belongs to the user
    const project = await Project.findOne({ _id: projectId, user: req.user._id });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or does not belong to the user' });
    }

    const upload = new Upload({
      project: projectId,
      type,
      name,
      transcript,
      rssUrl: type === 'RSS' ? rssUrl : undefined,
      youtubeUrl: type === 'YouTube' ? youtubeUrl : undefined,
      // Use the filePath obtained from multer for File uploads
      filePath: type === 'File' ? filePath : undefined,
    });

    const createdUpload = await upload.save();
    res.status(201).json(createdUpload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all uploads for a project
// @route   GET /api/uploads/project/:projectId
// @access  Private
const getUploadsForProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Check if the project exists and belongs to the user
    const project = await Project.findOne({ _id: projectId, user: req.user._id });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or does not belong to the user' });
    }

    const uploads = await Upload.find({ project: projectId });
    res.json(uploads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single upload by ID
// @route   GET /api/uploads/:uploadId
// @access  Private
const getUploadById = async (req, res) => {
  const { uploadId } = req.params;

  try {
    const upload = await Upload.findById(uploadId);

    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    // Ensure the upload belongs to a project owned by the user
    const project = await Project.findOne({ _id: upload.project, user: req.user._id });

    if (!project) {
       return res.status(401).json({ message: 'Not authorized to access this upload' });
    }

    res.json(upload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update upload transcript
// @route   PUT /api/uploads/:uploadId/transcript
// @access  Private
const updateTranscript = async (req, res) => {
  const { uploadId } = req.params;
  const { transcript } = req.body;

  try {
    const upload = await Upload.findById(uploadId);

    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    // Ensure the upload belongs to a project owned by the user
    const project = await Project.findOne({ _id: upload.project, user: req.user._id });

    if (!project) {
       return res.status(401).json({ message: 'Not authorized to update this upload' });
    }

    upload.transcript = transcript;
    const updatedUpload = await upload.save();

    res.json(updatedUpload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an upload
// @route   DELETE /api/uploads/:uploadId
// @access  Private
const deleteUpload = async (req, res) => {
  const { uploadId } = req.params;

  try {
    const upload = await Upload.findById(uploadId);

    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    // Ensure the upload belongs to a project owned by the user
    const project = await Project.findOne({ _id: upload.project, user: req.user._id });

    if (!project) {
       return res.status(401).json({ message: 'Not authorized to delete this upload' });
    }

    // If it's a file upload, attempt to delete the file from the filesystem
    if (upload.type === 'File' && upload.filePath) {
        // Construct absolute path or use relative path based on your multer destination
        const absoluteFilePath = path.join(__dirname, '..', upload.filePath); // Adjust path as needed
        fs.unlink(absoluteFilePath, (err) => {
            if (err) {
                console.error(`Error deleting file: ${upload.filePath}`, err);
                // Decide whether to halt deletion or proceed. 
                // Proceeding might leave orphaned files, halting might leave orphaned DB entries.
                // For simplicity, we'll log and proceed with DB deletion.
            }
        });
    }

    await upload.deleteOne(); // Use deleteOne() or findByIdAndDelete()

    res.json({ message: 'Upload removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createUpload, getUploadsForProject, getUploadById, updateTranscript, deleteUpload }; 