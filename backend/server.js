const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'got-explorer-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
const users = new Map();
const userFavorites = new Map();

// Demo user
const demoUserId = uuidv4();
const demoUser = {
  id: demoUserId,
  email: 'demo@got-explorer.com',
  firstName: 'Demo',
  lastName: 'User',
  createdAt: new Date()
};
users.set('demo@got-explorer.com', {
  ...demoUser,
  password: bcrypt.hashSync('demo123', 10)
});
userFavorites.set(demoUserId, []);

// Utility functions
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware to authenticate requests
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  req.userId = decoded.userId;
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    users: users.size,
    favorites: userFavorites.size
  });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    if (users.has(email)) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const user = {
      id: userId,
      email,
      firstName,
      lastName,
      createdAt: new Date()
    };

    // Store user
    users.set(email, { ...user, password: hashedPassword });
    userFavorites.set(userId, []);

    // Generate token
    const token = generateToken(userId);

    res.status(201).json({
      user,
      token,
      expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const userData = users.get(email);
    if (!userData) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userData.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(userData.id);

    // Return user data (without password)
    const { password: _, ...user } = userData;

    res.json({
      user,
      token,
      expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    // Find user by ID
    const user = Array.from(users.values()).find(u => u.id === req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data (without password)
    const { password: _, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Favorites Routes
app.get('/api/favorites', authenticateToken, (req, res) => {
  try {
    const favorites = userFavorites.get(req.userId) || [];
    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/favorites', authenticateToken, (req, res) => {
  try {
    const character = req.body;
    
    if (!character || !character.url) {
      return res.status(400).json({ message: 'Invalid character data' });
    }

    const favorites = userFavorites.get(req.userId) || [];
    
    // Check if character is already in favorites
    const isAlreadyFavorite = favorites.some(fav => fav.url === character.url);
    if (isAlreadyFavorite) {
      return res.status(409).json({ message: 'Character already in favorites' });
    }

    // Add to favorites
    favorites.push(character);
    userFavorites.set(req.userId, favorites);

    res.status(201).json({ message: 'Character added to favorites' });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/favorites/:characterUrl', authenticateToken, (req, res) => {
  try {
    const characterUrl = decodeURIComponent(req.params.characterUrl);
    const favorites = userFavorites.get(req.userId) || [];
    
    // Remove character from favorites
    const updatedFavorites = favorites.filter(fav => fav.url !== characterUrl);
    userFavorites.set(req.userId, updatedFavorites);

    res.json({ message: 'Character removed from favorites' });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/favorites', authenticateToken, (req, res) => {
  try {
    userFavorites.set(req.userId, []);
    res.json({ message: 'All favorites cleared' });
  } catch (error) {
    console.error('Clear favorites error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`👤 Demo account: demo@got-explorer.com / demo123`);
  console.log(`📊 Users: ${users.size}, Favorites: ${userFavorites.size}`);
});

module.exports = app;