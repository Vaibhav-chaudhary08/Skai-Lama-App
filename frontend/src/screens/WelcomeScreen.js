import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/WelcomeScreen.css'; // We will create this CSS file

const API_URL = process.env.REACT_APP_API_URL || ''; // Use environment variable for API URL

function WelcomeScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const url = `${API_URL}/api/auth/` + (isRegister ? 'register' : 'login'); // Construct full API URL

      const { data } = await axios.post(url, { email, password }, config);

      // Assuming the backend sends a token upon successful login/register
      localStorage.setItem('userInfo', JSON.stringify(data));

      // Redirect to projects page on success
      navigate('/projects');

    } catch (error) {
      setMessage(error.response && error.response.data.message
        ? error.response.data.message
        : error.message);
    }
  };

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <h1>Welcome to Ques.AI</h1>
        <h2>{isRegister ? 'Sign Up' : 'Login'}</h2>
        {message && <p className="error-message">{message}</p>}
        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">
            {isRegister ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <p>
          {isRegister ? 'Already have an account?' : 'New Customer?'}{' '}
          <button className="link-button" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default WelcomeScreen; 