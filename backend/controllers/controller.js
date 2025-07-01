// controllers/controller.js
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
