// routes/transactions.js
import { Router } from 'express';
import { getAllTransactions, addTransaction } from '../controllers/controller.js';

const router = Router();

router.get('/', getAllTransactions);
router.post('/', addTransaction);

export default router;