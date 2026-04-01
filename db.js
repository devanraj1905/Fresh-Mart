require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false
    }
});

db.connect(err => {
    if (err) {
        console.error('Database failed to connect:', err);
        return;
    }
    console.log('Database connected!');
});

module.exports = db;