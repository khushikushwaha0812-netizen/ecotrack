const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const db = require('./db');

const app = express();

app.use(express.json());
app.use(session({
  secret: 'ecotrack-secret-key',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// ---------- helper: only logged-in users ----------
function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Please login first' });
  next();
}

// ---------- image upload settings ----------
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, name + path.extname(file.originalname).toLowerCase());
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('Only JPG, PNG or WEBP images are allowed'), ok);
  }
});
function uploadImage(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}

// ---------- REGISTER ----------
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const hash = bcrypt.hashSync(password, 10);
  db.run(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hash],
    function (err) {
      if (err) return res.status(400).json({ error: 'Email already registered' });
      res.json({ message: 'Registered successfully' });
    }
  );
});

// ---------- LOGIN ----------
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Wrong email or password' });
    }
    req.session.user = { id: user.id, name: user.name, role: user.role };
    res.json({ message: 'Login successful', role: user.role });
  });
});

app.get('/api/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
  res.json(req.session.user);
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out' }));
});

// ---------- SUBMIT A COMPLAINT ----------
app.post('/api/complaints', requireLogin, uploadImage, (req, res) => {
  const { category, description, location, latitude, longitude } = req.body;
  if (!category || !description || !location) {
    return res.status(400).json({ error: 'Category, description and location are required' });
  }
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const complaintId = 'CMP-' + day + '-' + Math.floor(1000 + Math.random() * 9000);
  const image = req.file ? req.file.filename : null;

  db.run(
    `INSERT INTO complaints
     (complaint_id, user_id, category, description, image, location, latitude, longitude)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [complaintId, req.session.user.id, category, description, image,
     location, latitude || null, longitude || null],
    function (err) {
      if (err) return res.status(500).json({ error: 'Could not save complaint' });
      res.json({ message: 'Complaint submitted', complaint_id: complaintId });
    }
  );
});

// ---------- MY COMPLAINTS (with search + filter) ----------
app.get('/api/complaints/mine', requireLogin, (req, res) => {
  let sql = 'SELECT * FROM complaints WHERE user_id = ?';
  const params = [req.session.user.id];
  if (req.query.status) {
    sql += ' AND status = ?';
    params.push(req.query.status);
  }
  if (req.query.search) {
    sql += ' AND (complaint_id LIKE ? OR description LIKE ? OR location LIKE ?)';
    const s = '%' + req.query.search + '%';
    params.push(s, s, s);
  }
  sql += ' ORDER BY created_at DESC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// ---------- ONE COMPLAINT ----------
app.get('/api/complaints/:cid', requireLogin, (req, res) => {
  db.get('SELECT * FROM complaints WHERE complaint_id = ?', [req.params.cid], (err, row) => {
    if (!row) return res.status(404).json({ error: 'Complaint not found' });
    if (row.user_id !== req.session.user.id && req.session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not allowed' });
    }
    res.json(row);
  });
});

app.listen(3000, () => {
  console.log('Running at http://localhost:3000');
});