import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import transactionRoutes from './routes/transactions.js';
import { authRouter } from './routes/authroutes.js'

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve API routes first
app.use('/api/transactions', transactionRoutes);

// Serve frontend from dist (outside backend folder)
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Catch-all for Vue Router SPA
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.get('/', (req,res) => res.send('Auth API running'))

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
