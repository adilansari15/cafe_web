require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'cafe_web_secret_key_2024';

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/', (req, res) => res.send('Cafe Web API is running'));

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe_web';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(()=> console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
const Order = require('./models/Order');
const User = require('./models/User');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ========== AUTH ENDPOINTS ==========

// User Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    console.log('POST /api/auth/signup received');
    const { email, password, username } = req.body;
    
    // Validate required fields
    if (!email || !password || !username) {
      return res.status(400).json({ success: false, message: 'Username, email and password are required' });
    }
    
    const uname = String(username).toLowerCase().trim();
    const mail = String(email).toLowerCase().trim();

    // Check if user/email/username already exists
    const existingUser = await User.findOne({ $or: [ { email: mail }, { username: uname } ] });
    if (existingUser) {
      if (existingUser.email === mail) return res.status(400).json({ success: false, message: 'Email already registered' });
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }
    
    // Create new user
    const user = new User({
      username: uname,
      email: mail,
      password
    });
    
    const savedUser = await user.save();
    console.log('User created:', savedUser._id);
    
    // Create JWT token
    const token = jwt.sign(
      { userId: savedUser._id, email: savedUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data without password
    const userResponse = {
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      name: savedUser.name
    };
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });
    
  } catch (err) {
    console.error('Signup error:', err);
    // handle duplicate key error more gracefully
    if(err && err.code === 11000){
      const key = Object.keys(err.keyValue || {})[0];
      return res.status(400).json({ success: false, message: `${key} already exists` });
    }
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('POST /api/auth/login received');
    const { identifier, password, email, username } = req.body;
    const ident = (identifier || email || username || '').toString().toLowerCase().trim();
    
    // Validate required fields
    if (!ident || !password) {
      return res.status(400).json({ success: false, message: 'Identifier (username/email) and password are required' });
    }
    
    // Find user by email or username
    const user = await User.findOne({ $or: [ { email: ident }, { username: ident } ] });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    console.log('User login successful:', user._id);
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data without password
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name
    };
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Get current user profile (protected route)
app.get('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile (protected route)
app.put('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    console.log('PUT /api/auth/profile received');
    const { name, phone, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone, address },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    console.log('User profile updated:', user._id);
    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
});

// Verify token
app.post('/api/auth/verify', verifyToken, (req, res) => {
  res.json({ success: true, message: 'Token is valid', userId: req.user.userId });
});

// ========== ORDER ENDPOINTS ==========
app.post('/api/orders', async (req, res) => {
  try{
    console.log('POST /api/orders received');
    console.log('Request body:', req.body);
    
    const { userId, items, total, address } = req.body;
    
    // Validate required fields
    if(!items || items.length === 0){
      console.error('Error: items array is empty or missing');
      return res.status(400).json({ success: false, error: 'Items array is required and cannot be empty' });
    }
    
    if(total === undefined || total === null){
      console.error('Error: total is missing');
      return res.status(400).json({ success: false, error: 'Total is required' });
    }
    
    const order = new Order({ userId, items, total, address });
    console.log('Order object created:', order);
    
    const savedOrder = await order.save();
    console.log('Order saved successfully:', savedOrder);
    
    res.status(201).json({ success: true, order: savedOrder });
  }catch(err){
    console.error('Error creating order:', err);
    res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

// Get orders (optionally by user)
app.get('/api/orders', async (req, res) => {
  try{
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  }catch(err){
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
