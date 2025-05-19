import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
// import '../styles/ProjectsListScreen.css'; // We will create this CSS file

const API_URL = process.env.REACT_APP_API_URL || ''; // Use environment variable for API URL

function ProjectsListScreen() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) {
        navigate('/'); // Redirect to login if not authenticated
        return;
      }

      const { token } = JSON.parse(userInfo);

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const { data } = await axios.get(`${API_URL}/api/projects`, config); // Use API_URL
        setProjects(data);
        setLoading(false);
      } catch (err) {
        setError(err.response && err.response.data.message
          ? err.response.data.message
          : err.message);
        setLoading(false);
        // Optionally, redirect to login on auth error
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
           navigate('/');
        }
      }
    };

    fetchProjects();
  }, [navigate]); // Add navigate to dependency array

  if (loading) {
    return <div className="projects-list-container">Loading projects...</div>;
  }

  if (error) {
    return <div className="projects-list-container error-message">Error: {error}</div>;
  }

  return (
    <div className="projects-list-container">
      <h1>My Projects</h1>
      <Link to="/create-project">
        <button>Create New Project</button>
      </Link>
      {projects.length === 0 ? (
        <p>No projects found. Create one to get started!</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project._id}>
              <Link to={`/projects/${project._id}/add-podcast`}>
                {project.name} ({project.type})
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProjectsListScreen; 