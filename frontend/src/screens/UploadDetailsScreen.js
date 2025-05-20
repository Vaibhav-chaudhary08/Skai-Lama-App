import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/UploadDetailsScreen.css'; // We will create this CSS file

const API_URL = process.env.REACT_APP_API_URL || ''; // Use environment variable for API URL

function UploadDetailsScreen() {
  const { projectId, uploadId } = useParams();
  const navigate = useNavigate();

  const [upload, setUpload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUploadDetails = async () => {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) {
        navigate('/');
        return;
      }

      const { token } = JSON.parse(userInfo);

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const { data } = await axios.get(`${API_URL}/api/uploads/${uploadId}`, config); // Use API_URL
        setUpload(data);
        setLoading(false);
      } catch (err) {
        setError(err.response && err.response.data.message
          ? err.response.data.message
          : err.message);
        setLoading(false);
         if (err.response && (err.response.status === 401 || err.response.status === 403)) {
           navigate('/');
        }
      }
    };

    fetchUploadDetails();
  }, [uploadId, navigate]); // Depend on uploadId and navigate

  if (loading) {
    return <div className="upload-details-container">Loading upload details...</div>;
  }

  if (error) {
    return <div className="upload-details-container error-message">Error: {error}</div>;
  }

  if (!upload) {
      return <div className="upload-details-container">Upload not found.</div>;
  }

  return (
    <div className="upload-details-container">
      <h1>Upload Details</h1>
      <button onClick={() => navigate(`/projects/${projectId}/add-podcast`)}>Back to Add Podcast</button>

      <div className="upload-details-card">
        <h2>{upload.name}</h2>
        <p><strong>Type:</strong> {upload.type}</p>
        {upload.type === 'RSS' && <p><strong>RSS Feed URL:</strong> {upload.rssUrl}</p>}
        {upload.type === 'YouTube' && <p><strong>YouTube URL:</strong> {upload.youtubeUrl}</p>}
        {upload.type === 'File' && <p><strong>File Path:</strong> {upload.filePath}</p>}
        
        {/* Link to Edit Transcript Screen */}
        <Link to={`/projects/${projectId}/uploads/${uploadId}/edit-transcript`}>
          <button>Edit Transcript</button>
        </Link>
      </div>
    </div>
  );
}

export default UploadDetailsScreen; 