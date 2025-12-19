require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Successfully connected to database!');

        const [rows] = await connection.query("SHOW TABLES LIKE 'users'");
        if (rows.length > 0) {
            console.log('Users table exists!');
        } else {
            console.error('Users table missing!');
        }

        await connection.end();
    } catch (error) {
        console.error('Connection failed:', error.message);
    }
}

testConnection();
