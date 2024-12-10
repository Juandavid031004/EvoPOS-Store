import express from 'express';
import usersRouter from './users.js';
import productsRouter from './products.js';
import salesRouter from './sales.js';
import customersRouter from './customers.js';
import suppliersRouter from './suppliers.js';
import ordersRouter from './orders.js';
import expensesRouter from './expenses.js';
import syncRouter from './sync.js';

const router = express.Router();

router.use('/users', usersRouter);
router.use('/products', productsRouter);
router.use('/sales', salesRouter);
router.use('/customers', customersRouter);
router.use('/suppliers', suppliersRouter);
router.use('/orders', ordersRouter);
router.use('/expenses', expensesRouter);
router.use('/sync', syncRouter);

export default router;