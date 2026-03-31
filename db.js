const mysql = require('mysql2');
const db = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'shopping_cart',
    
})
db.connect(err => {
    if (err) {
        console.error('Database failed to connect:', err);
        return;
    }
    console.log('Database connected!');
});

module.exports = db;
