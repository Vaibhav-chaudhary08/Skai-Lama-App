const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Ensure bcrypt is imported

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Explicitly select the password field
    const user = await User.findOne({ email }).select('+password');

    // Add logging here to inspect the user object and password
    console.log('Fetched user (with password selected):', user);
    console.log('User password (after explicit select):', user ? user.password : 'User not found or password not selected');

    if (user && user.password && (await user.matchPassword(password))) { // Added check for user.password
      // Ask for email in the popup and proceed - This will be handled on the frontend
      res.json({
        _id: user._id,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    // Log the actual error for debugging
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser }; 