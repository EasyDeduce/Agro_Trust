const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, walletAddress, role, name, userId, location, company } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { walletAddress }, { username }, { userId }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with that email, username, wallet address, or user ID' 
      });
    }
    
    // Create new user based on role
    const userData = {
      username,
      email,
      password,
      walletAddress,
      role,
      name,
      userId,
      location
    };
    
    if (role === 'certifier' && company) {
      userData.company = company;
    }
    
    const newUser = new User(userData);
    await newUser.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, walletAddress: newUser.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        walletAddress: newUser.walletAddress,
        role: newUser.role,
        name: newUser.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Validate password
    const isValid = await user.isValidPassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, walletAddress: user.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Verify wallet address
router.post('/verify-wallet', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ message: 'Wallet not registered' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, walletAddress: user.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(200).json({
      message: 'Wallet verified',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        walletAddress: user.walletAddress,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Wallet verification error:', error);
    res.status(500).json({ message: 'Server error during wallet verification' });
  }
});

// Delete user account
router.delete('/delete', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }
    
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove user
    await User.findByIdAndDelete(user._id);
    // Optionally scrub batch ownerships when farmer is deleted
    try {
      const Batch = require('../models/Batch');
      if (user.role === 'farmer') {
        await Batch.updateMany({ farmer: walletAddress }, { $set: { farmer: null } });
      } else if (user.role === 'certifier') {
        await Batch.updateMany({ certifier: walletAddress }, { $set: { certifier: null, status: 'CREATED', certifiedAt: null, cropHealth: null, labResults: null, expiry: null } });
      } else if (user.role === 'retailer') {
        await Batch.updateMany({ retailer: walletAddress }, { $set: { retailer: null, status: 'CERTIFIED', purchasedAt: null } });
      }
    } catch (cleanupErr) {
      console.error('Cleanup after account deletion failed:', cleanupErr);
    }
    
    res.status(200).json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ message: 'Server error during account deletion' });
  }
});

module.exports = router;