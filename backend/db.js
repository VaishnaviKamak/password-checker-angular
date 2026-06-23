const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI;
const isMongo = !!MONGODB_URI;

let connectionPromise = null;

async function ensureConnection() {
  if (!isMongo) return;

  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // If not connecting yet, initiate connection
  if (mongoose.connection.readyState !== 2) {
    console.log('Connecting to MongoDB database (lazy/serverless)...');
    connectionPromise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false // Fail fast instead of hanging in serverless if connection fails
    });
  }

  // Await the active connection promise to complete
  await connectionPromise;
}

// ── MongoDB Schemas & Models ──
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const checkSchema = new mongoose.Schema({
  label: String,
  passed: Boolean
});

const passwordSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  password: { type: String, required: true },
  score: { type: Number, default: 0 },
  strength: { type: String, default: 'Weak' },
  checks: [checkSchema],
  timestamp: { type: Date, default: Date.now }
});

const MongoUser = isMongo ? mongoose.model('User', userSchema) : null;
const MongoPassword = isMongo ? mongoose.model('Password', passwordSchema) : null;

// ── JSON file storage variables ──
const DB_PATH = path.join(__dirname, 'database.json');

function initDb() {
  if (!fs.existsSync(DB_PATH)) {
    const initialData = { users: [], passwords: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

function readData() {
  initDb();
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading JSON database, resetting:', error);
    const initialData = { users: [], passwords: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }
}

function writeData(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// ── Shared API Methods ──

// Find user by email
async function findUserByEmail(email) {
  if (isMongo) {
    await ensureConnection();
    return await MongoUser.findOne({ email: email.toLowerCase() });
  } else {
    const data = readData();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }
}

// Save a new user
async function saveUser(user) {
  if (isMongo) {
    await ensureConnection();
    const newUser = new MongoUser({
      name: user.name,
      email: user.email.toLowerCase(),
      password: user.password
    });
    await newUser.save();
    return newUser;
  } else {
    const data = readData();
    data.users.push(user);
    writeData(data);
    return user;
  }
}

// Get password history for a user
async function getPasswordHistory(email) {
  if (isMongo) {
    await ensureConnection();
    return await MongoPassword.find({ email: email.toLowerCase() }).sort({ timestamp: -1 });
  } else {
    const data = readData();
    return data.passwords.filter(p => p.email.toLowerCase() === email.toLowerCase());
  }
}

// Save a password check to history
async function savePasswordCheck(email, passwordRecord) {
  if (isMongo) {
    await ensureConnection();
    const newRecord = new MongoPassword({
      email: email.toLowerCase(),
      password: passwordRecord.password,
      score: passwordRecord.score,
      strength: passwordRecord.strength,
      checks: passwordRecord.checks
    });
    await newRecord.save();
    return newRecord;
  } else {
    const data = readData();
    const newRecord = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      email: email.toLowerCase(),
      ...passwordRecord,
      timestamp: new Date().toISOString()
    };
    data.passwords.push(newRecord);
    writeData(data);
    return newRecord;
  }
}

// Delete a password check by email and ID
async function deletePasswordCheck(email, id) {
  if (isMongo) {
    await ensureConnection();
    await MongoPassword.deleteOne({ _id: id, email: email.toLowerCase() });
  } else {
    const data = readData();
    data.passwords = data.passwords.filter(
      p => !(p.id === id && p.email.toLowerCase() === email.toLowerCase())
    );
    writeData(data);
  }
}

module.exports = {
  findUserByEmail,
  saveUser,
  getPasswordHistory,
  savePasswordCheck,
  deletePasswordCheck
};
