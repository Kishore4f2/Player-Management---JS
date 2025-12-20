const express = require('express');
const mysql = require('mysql2/promise'); // Using promise wrapper
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const path = require('path');
const jsonServer = require('json-server');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// JSON Server for Player Data (Preserving existing functionality)
// We mount it on /Data to match the script.js calls if they were relative, 
// BUT script.js calls external URL. If user changes script.js to local, this is needed.
// Also if they push to Render, this fills the gap.
// Note: json-server router should be separate.


// Database Configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
    ssl: {
        rejectUnauthorized: false
    }
};

let db;

// Initialize Database Function
async function initDatabase() {
    try {
        // Connect directly to the database
        db = await mysql.createConnection({
            ...dbConfig,
            database: process.env.DB_NAME
        });

        console.log('Connected to MySQL Database (Cloud).');

        // Create Users Table
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.query(createTableQuery);

        // Check if role column exists, if not add it (for existing tables)
        const [columns] = await db.query(`SHOW COLUMNS FROM users LIKE 'role'`);
        if (columns.length === 0) {
            await db.query(`ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user'`);
            console.log('Role column added to users table.');
        }

        console.log('Users table checked/created.');

    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

// Routes

// Register Endpoint
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user exists
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Determine role
        const role = (email === 'satyakishore273@gmail.com') ? 'admin' : 'user';

        // Insert new user (Note: In production, password should be hashed!)
        const [result] = await db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, password, role]);

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];
        res.status(200).json({
            message: 'Login successful',
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Get All Users Endpoint
app.get('/users', async (req, res) => {
    console.log('GET /users called');
    try {
        const [rows] = await db.query('SELECT id, name, email, role FROM users'); // Exclude password
        console.log('Fetched users:', rows);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Update User Role Endpoint
app.patch('/users/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.status(200).json({ message: 'Role updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating role' });
    }
});

const jsonRouter = jsonServer.router('db.json');
const jsonMiddlewares = jsonServer.defaults();
app.use('/', jsonMiddlewares, jsonRouter); // Mount at root so /Data matches 'Data' key

// Start Server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});