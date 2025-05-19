const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['RSS', 'YouTube', 'File'], // Restrict to these types
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  transcript: {
    type: String,
  }, // Optional field for transcripts
  // Fields specific to upload types (can be added or refined later based on exact needs)
  rssUrl: {
    type: String,
  },
  youtubeUrl: {
    type: String,
  },
  filePath: {
    type: String,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const Upload = mongoose.model('Upload', uploadSchema);

module.exports = Upload; 