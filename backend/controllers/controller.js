// controllers/controller.js
import bcrypt from 'bcryptjs'
import jwt    from 'jsonwebtoken'
import { pool } from '../db.js';   // ← named export from db.js

// GET /api/transactions
export async function getAllTransactions(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM transactions ORDER BY date DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/transactions
export async function addTransaction(req, res) {
  const { type, mobile, amount, date, paybill } = req.body;

  if (!type || !mobile || !amount || !date || !paybill) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO transactions (type, mobile, amount, date, paybill) VALUES (?, ?, ?, ?, ?)',
      [type, mobile, amount, date, paybill]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}


const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

export const register = async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ message:'Missing fields' })

  const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
  if (exists.length) return res.status(409).json({ message:'Email already registered' })

  const hash = await bcrypt.hash(password, 12)
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, hash]
  )

  const user = { id: result.insertId, name, email }
  res.json({ token: signToken(user), user })
}

export const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message:'Missing fields' })

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
  const user = rows[0]
  if (!user) return res.status(401).json({ message:'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ message:'Invalid credentials' })

  res.json({ token: signToken(user), user: { id:user.id, name:user.name, email:user.email } })
}