import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/EditTranscriptScreen.css';

const API_URL = process.env.REACT_APP_API_URL || ''; // Use environment variable for API URL

function EditTranscriptScreen() {
  const { projectId, uploadId } = useParams();
  const navigate = useNavigate();

  const [upload, setUpload] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const fetchUpload = async () => {
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
        setTranscript(data.transcript || ''); // Set initial transcript, default to empty string
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

    fetchUpload();
  }, [uploadId, navigate]); // Depend on uploadId and navigate

  const handleSaveTranscript = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');

    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/');
      return;
    }

    const { token } = JSON.parse(userInfo);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      // Assuming backend PUT expects { transcript }
      await axios.put(`${API_URL}/api/uploads/${uploadId}/transcript`, { transcript }, config); // Use API_URL

      setSaveMessage('Transcript saved successfully!');
      setSaving(false);
      // Optionally, show a success message temporarily
    } catch (err) {
       setSaveMessage(`Error saving transcript: ${err.response && err.response.data.message
        ? err.response.data.message
        : err.message}`);
      setSaving(false);
       if (err.response && (err.response.status === 401 || err.response.status === 403)) {
           navigate('/');
        }
    }
  };

  if (loading) {
    return <div className="edit-transcript-container">Loading transcript...</div>;
  }

  if (error) {
    return <div className="edit-transcript-container error-message">Error: {error}</div>;
  }

  if (!upload) {
      return <div className="edit-transcript-container">Upload not found.</div>;
  }

  return (
    <div className="edit-transcript-container">
      <h1>Edit Transcript for {upload.name}</h1>
       <button onClick={() => navigate(`/projects/${projectId}/add-podcast`)}>Back to Uploads</button>

      {saveMessage && <p className={saveMessage.includes('Error') ? 'error-message' : 'info-message'}>{saveMessage}</p>}

      <form onSubmit={handleSaveTranscript}>
        <div className="form-group">
          <label htmlFor="transcript">Transcript</label>
          <textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows="10"
            cols="50"
          ></textarea>
        </div>
        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Transcript'}</button>
      </form>
    </div>
  );
}

export default EditTranscriptScreen; 