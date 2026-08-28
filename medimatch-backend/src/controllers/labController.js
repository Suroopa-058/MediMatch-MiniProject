const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ── LAB REGISTER ──
const labRegister = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }

    const [existing] = await db.query('SELECT id FROM labs WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO labs (name, email, password, phone, address) VALUES (?,?,?,?,?)',
      [name, email, hashed, phone, address]
    );

    res.status(201).json({ message: '✅ Lab registered successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── LAB LOGIN ──
const labLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query('SELECT * FROM labs WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(404).json({ message: 'Lab not found' });

    const lab = rows[0];
    const isMatch = await bcrypt.compare(password, lab.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { id: lab.id, role: 'lab' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '✅ Login successful!',
      token,
      lab: {
        id: lab.id,
        name: lab.name,
        email: lab.email,
        phone: lab.phone,
        address: lab.address,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { labRegister, labLogin };