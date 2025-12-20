const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            ssl: { rejectUnauthorized: false }
        });
        const [rows] = await connection.query('SELECT * FROM users');
        console.log('Users in DB:', rows);
        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUsers();
