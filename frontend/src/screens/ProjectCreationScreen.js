import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/ProjectCreationScreen.css';

const API_URL = process.env.REACT_APP_API_URL || ''; // Use environment variable for API URL

function ProjectCreationScreen() {
  const [name, setName] = useState('');
  const [type, setType] = useState(''); // Assuming 'type' can be a simple text input for now
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/'); // Redirect to login if not authenticated
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

      // Assuming backend expects { name, type }
      await axios.post(`${API_URL}/api/projects`, { name, type }, config); // Use API_URL

      // Redirect to projects page on success
      navigate('/projects');

    } catch (error) {
      setMessage(error.response && error.response.data.message
        ? error.response.data.message
        : error.message);
    }
  };

  return (
    <div className="project-creation-container">
      <div className="project-creation-card">
        <h1>Create New Project</h1>
        {message && <p className="error-message">{message}</p>}
        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label htmlFor="name">Project Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {/* Assuming 'type' is a simple text input for now based on the Figma, 
            but could be a dropdown/select based on specific types later */}
          <div className="form-group">
            <label htmlFor="type">Project Type</label>
            <input
              type="text"
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            />
          </div>
          <button type="submit">Create Project</button>
        </form>
      </div>
    </div>
  );
}

export default ProjectCreationScreen; 