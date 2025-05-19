import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/AddPodcastScreen.css';

const API_URL = process.env.REACT_APP_API_URL || ''; // Use environment variable for API URL

function AddPodcastScreen() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [uploadType, setUploadType] = useState(null); // 'RSS', 'YouTube', 'File'
  const [rssUrl, setRssUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploadFile, setUploadFile] = useState(null); // For file uploads
  const [name, setName] = useState(''); // Name for the upload
  const [message, setMessage] = useState('');
  
  const [uploads, setUploads] = useState([]); // State to hold existing uploads
  const [loadingUploads, setLoadingUploads] = useState(true); // Loading state for uploads
  const [uploadsError, setUploadsError] = useState(null); // Error state for uploads
  const [deleting, setDeleting] = useState(false); // Deleting state

  // Fetch uploads for the project on component mount and after uploads/deletions
  const fetchUploads = async () => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/');
      return;
    }

    const { token } = JSON.parse(userInfo);

    try {
      setLoadingUploads(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // Fetch uploads for the specific project
      const { data } = await axios.get(`${API_URL}/api/uploads/project/${projectId}`, config); // Use API_URL
      setUploads(data);
      setLoadingUploads(false);
    } catch (err) {
       setUploadsError(err.response && err.response.data.message
        ? err.response.data.message
        : err.message);
      setLoadingUploads(false);
       if (err.response && (err.response.status === 401 || err.response.status === 403)) {
         navigate('/');
      }
    }
  };

  useEffect(() => {
    fetchUploads();
  }, [projectId, navigate, fetchUploads]); // Depend on projectId, navigate, and fetchUploads

  const handleUploadTypeSelect = (type) => {
    setUploadType(type);
    setMessage(''); // Clear messages on type change
    // Reset form fields when changing type, except possibly name if it's shared
    if (type !== 'RSS') setRssUrl('');
    if (type !== 'YouTube') setYoutubeUrl('');
    if (type !== 'File') setUploadFile(null);
    setName(''); // Clear name when changing upload type
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage('');

    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/');
      return;
    }

    const { token } = JSON.parse(userInfo);

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const uploadData = new FormData(); // Use FormData for mixed data types, especially files
    uploadData.append('project', projectId);
    uploadData.append('type', uploadType);
    uploadData.append('name', name);

    try {
      if (uploadType === 'RSS') {
        if (!rssUrl) { setMessage('RSS Feed URL is required.'); return; }
        uploadData.append('rssUrl', rssUrl);
        config.headers['Content-Type'] = 'application/json'; // Ensure correct content type for non-file uploads
        await axios.post(`${API_URL}/api/uploads`, { project: projectId, type: uploadType, name, rssUrl }, config); // Use API_URL

      } else if (uploadType === 'YouTube') {
         if (!youtubeUrl) { setMessage('YouTube URL is required.'); return; }
        uploadData.append('youtubeUrl', youtubeUrl);
         config.headers['Content-Type'] = 'application/json'; // Ensure correct content type for non-file uploads
        await axios.post(`${API_URL}/api/uploads`, { project: projectId, type: uploadType, name, youtubeUrl }, config); // Use API_URL

      } else if (uploadType === 'File') {
        if (!uploadFile) {
            setMessage('Please select a file to upload.');
            return;
        }
        uploadData.append('file', uploadFile); // Append the actual file
        // When sending FormData, browsers typically set the Content-Type header automatically
        // to multipart/form-data, so we don't explicitly set it here.
        delete config.headers['Content-Type']; // Let browser set Content-Type for FormData
        await axios.post(`${API_URL}/api/uploads`, uploadData, config); // Use API_URL

      } else {
        setMessage('Please select an upload type.');
        return;
      }

      setMessage(`${uploadType} uploaded successfully!`);
      // After successful upload, refresh the list of uploads
      fetchUploads(); // Refresh uploads list
      setName(''); // Clear name field after successful upload
      setRssUrl(''); // Clear RSS URL field
      setYoutubeUrl(''); // Clear YouTube URL field
      setUploadFile(null); // Clear file input
      // Note: Clearing file input programmatically requires accessing the input element directly, which can be complex. 
      // For simplicity, the display will just show 'No file chosen' after upload.
      setUploadType(null); // Reset upload type selection

    } catch (error) {
      setMessage(error.response && error.response.data.message
        ? error.response.data.message
        : error.message);
    }
  };

  const handleDeleteUpload = async (uploadIdToDelete) => {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) {
        navigate('/');
        return;
      }

      const { token } = JSON.parse(userInfo);

      try {
          setDeleting(true);
          const config = {
              headers: {
                Authorization: `Bearer ${token}`,
              },
          };
          await axios.delete(`${API_URL}/api/uploads/${uploadIdToDelete}`, config); // Use API_URL
          setMessage('Upload deleted successfully!');
          fetchUploads(); // Refresh uploads list
      } catch (error) {
           setMessage(`Error deleting upload: ${error.response && error.response.data.message
            ? error.response.data.message
            : error.message}`);
      } finally {
          setDeleting(false);
      }
  };


  return (
    <div className="add-podcast-container">
      <h1>Add Podcast to Project {projectId}</h1>
       <button onClick={() => navigate(-1)}>Back to Projects</button>

      <div>
        <h2>Select Upload Type:</h2>
        <button onClick={() => handleUploadTypeSelect('RSS')}>RSS Feed</button>
        <button onClick={() => handleUploadTypeSelect('YouTube')}>YouTube Video</button>
        <button onClick={() => handleUploadTypeSelect('File')}>Upload Files</button>
      </div>

      {message && <p className={message.includes('Error') ? 'error-message' : 'info-message'}>{message}</p>}

      {uploadType && ( // Only show form if an upload type is selected
        <form onSubmit={submitHandler}>
          <h3>Add {uploadType}</h3>
           <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {uploadType === 'RSS' && (
             <div className="form-group">
              <label htmlFor="rssUrl">RSS Feed URL</label>
              <input
                type="url"
                id="rssUrl"
                value={rssUrl}
                onChange={(e) => setRssUrl(e.target.value)}
                required
              />
            </div>
          )}

          {uploadType === 'YouTube' && (
             <div className="form-group">
              <label htmlFor="youtubeUrl">YouTube URL</label>
              <input
                type="url"
                id="youtubeUrl"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                required
              />
            </div>
          )}

          {uploadType === 'File' && (
             <div className="form-group">
              <label htmlFor="uploadFile">Select File</label>
              <input
                type="file"
                id="uploadFile"
                onChange={(e) => setUploadFile(e.target.files[0])}
                required
              />
            </div>
          )}
          <button type="submit">Upload {uploadType}</button>
        </form>
      )}


      {/* Area to display list of existing uploads for this project */}
       <div className="existing-uploads">
        <h2>Existing Uploads</h2>
        {loadingUploads ? (
            <p>Loading uploads...</p>
        ) : uploadsError ? (
            <p className="error-message">Error loading uploads: {uploadsError}</p>
        ) : uploads.length === 0 ? (
            <p>No uploads found for this project.</p>
        ) : (
            <ul>
                {uploads.map((uploadItem) => (
                    <li key={uploadItem._id}>
                         {uploadItem.name} ({uploadItem.type}){uploadItem.filePath && ` - ${uploadItem.filePath.split('/').pop()}`}
                        <Link to={`/projects/${projectId}/uploads/${uploadItem._id}`} style={{ marginLeft: '10px' }}>
                           View
                        </Link>
                         <button onClick={() => handleDeleteUpload(uploadItem._id)} disabled={deleting} style={{ marginLeft: '10px' }}>
                           {deleting ? 'Deleting...' : 'Delete'}
                         </button>
                    </li>
                ))}
            </ul>
        )}
      </div>
    </div>
  );
}

export default AddPodcastScreen; 
