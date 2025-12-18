const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// 1. GET /customers: Retrieve loan details of all customers
app.get('/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. GET /payments/:account_number: Retrieve payment history for a specific account
app.get('/payments/:account_number', async (req, res) => {
  const { account_number } = req.params;
  try {
    // join the tables to filter payments by the account number from the customers table
    const query = `
      SELECT p.payment_id, p.payment_date, p.payment_amount, p.status 
      FROM payments p
      JOIN customers c ON p.customer_id = c.id
      WHERE c.account_number = $1
      ORDER BY p.payment_date DESC
    `;
    const result = await pool.query(query, [account_number]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 3. POST /payments: Make a payment
app.post('/payments', async (req, res) => {
  const { account_number, amount } = req.body;

  if (!account_number || !amount) {
    return res.status(400).json({ msg: 'Please provide account number and amount' });
  }

  const client = await pool.connect();

  try {
    
    await client.query('BEGIN');

    const customerRes = await client.query(
      'SELECT id, emi_due FROM customers WHERE account_number = $1', 
      [account_number]
    );

    if (customerRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ msg: 'Customer not found' });
    }

    const customer = customerRes.rows[0];

    // Check if amount > emi due
    if (amount > parseFloat(customer.emi_due)) {
       await client.query('ROLLBACK');
       return res.status(400).json({ msg: 'Payment exceeds EMI due amount' });
    }

    const insertQuery = `
      INSERT INTO payments (customer_id, payment_amount, status) 
      VALUES ($1, $2, 'Success') 
      RETURNING *
    `;
    const paymentRes = await client.query(insertQuery, [customer.id, amount]);

    const updateQuery = `
      UPDATE customers 
      SET emi_due = emi_due - $1 
      WHERE id = $2
    `;
    await client.query(updateQuery, [amount, customer.id]);

    await client.query('COMMIT');

    res.json({ 
      msg: 'Payment Successful', 
      payment: paymentRes.rows[0],
      new_balance: parseFloat(customer.emi_due) - parseFloat(amount)
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});