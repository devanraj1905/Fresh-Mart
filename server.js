const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT||3000;

app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));        

// ✅ GET all products
app.get('/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ✅ POST place order
app.post('/orders', (req, res) => {
    const { customer_name, total, items } = req.body;

    const orderSql = 'INSERT INTO orders (customer_name, total) VALUES (?, ?)';
    db.query(orderSql, [customer_name, total], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const orderId = result.insertId;

        const itemSql = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';
        const values = items.map(item => [orderId, item.product_id, item.quantity, item.price]);

        db.query(itemSql, [values], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ message: 'Order placed successfully!', order_id: orderId });
        });
    });
});


app.get('/orders', (req, res) => {
    const sql = `
    SELECT 
      o.id, o.customer_name, o.total, o.status, o.created_at,
      p.name AS product_name, oi.quantity, oi.price
    FROM orders o
    JOIN order_items oi ON o.id  = oi.order_id
    JOIN products    p  ON p.id  = oi.product_id
    ORDER BY o.created_at DESC
  `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        // Group items under each order
        const orders = {};
        results.forEach(row => {
            if (!orders[row.id]) {
                orders[row.id] = {
                    id: row.id,
                    customer_name: row.customer_name,
                    total: row.total,
                    status: row.status,
                    created_at: row.created_at,
                    items: []
                };
            }
            orders[row.id].items.push({
                product_name: row.product_name,
                quantity: row.quantity,
                price: row.price
            });
        });

        res.json(Object.values(orders));
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});