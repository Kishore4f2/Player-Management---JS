const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
};

async function fixAdmin() {
    try {
        const db = await mysql.createConnection(dbConfig);
        console.log('Connected to Database.');

        const email = 'satyakishore273@gmail.com';

        // Check if user exists
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            console.log('User not found. Creating admin user...');
            // Insert user as admin
            await db.query(`INSERT INTO users (name, email, password, role) VALUES ('Satya Kishore', ?, 'Satya@123', 'admin')`, [email]);
            console.log('Admin user created successfully.');
        } else {
            console.log('User found. Updating role to admin...');
            await db.query(`UPDATE users SET role = 'admin' WHERE email = ?`, [email]);
            console.log('User role updated to admin.');
        }

        await db.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

fixAdmin();
