require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'password-checker-secret-key-12345';

// Enable CORS for Host (4200) and Remotes (4201, 4202)
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4201', 'http://localhost:4202'],
  credentials: true
}));

app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// --- Auth Routes ---

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    await db.saveUser(newUser);

    // Return success without password hash
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error during signup' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id || user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// --- Password History Routes ---

// Save checked password
app.post('/api/passwords/save', authenticateToken, async (req, res) => {
  try {
    const { password, score, strength, checks } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const record = {
      password,
      score: score || 0,
      strength: strength || 'Weak',
      checks: checks || []
    };

    const savedRecord = await db.savePasswordCheck(req.user.email, record);
    res.status(201).json({
      message: 'Password saved to history successfully',
      record: savedRecord
    });
  } catch (error) {
    console.error('Save password history error:', error);
    res.status(500).json({ error: 'Internal server error while saving password' });
  }
});

// Get user's password history
app.get('/api/passwords/history', authenticateToken, async (req, res) => {
  try {
    const history = await db.getPasswordHistory(req.user.email);
    
    // Sort by timestamp descending (newest first)
    // Note: Mongoose might return document objects, we make sure we copy or handle sort
    const sortedHistory = Array.from(history).sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));

    res.json(sortedHistory);
  } catch (error) {
    console.error('Get password history error:', error);
    res.status(500).json({ error: 'Internal server error while retrieving history' });
  }
});

// Delete a password check from history
app.delete('/api/passwords/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.deletePasswordCheck(req.user.email, id);
    res.json({ message: 'Password evaluation deleted successfully' });
  } catch (error) {
    console.error('Delete password history error:', error);
    res.status(500).json({ error: 'Internal server error while deleting record' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'Hybrid (Mongoose/JSON)' });
});

app.listen(PORT, () => {
  console.log(`Password Checker Backend API running on http://localhost:${PORT}`);
});
