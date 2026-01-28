// server.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const {OAuth2Client} = require('google-auth-library');

const app = express();

// Middleware setup
app.use(cors()); // Allow cross-origin requests from React frontend
app.use(express.json()); // Enable reading JSON data from request body
app.use(express.urlencoded({ extended: true })); // Enable reading URL-encoded data

// --- MySQL Connection Setup ---
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER, // CHANGE THIS to your MySQL username
    password: process.env.DB_PASSWORD, // CHANGE THIS to your MySQL password
    database: process.env.DB_NAME // Ensure this matches your database name
});

const client = new OAuth2Client();

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL Database.');
});

// ------------------------------------
// API: Authentication 
// ------------------------------------
app.post('/api/login', (req, res) => {
    if (req.header('Content-Type') === 'application/x-www-form-urlencoded') { // Sign-in with google
        const ticket = client.verifyIdToken({
            idToken: req.body.token,
            audience: process.env.GOOGLE_CLIENT_ID
        }).then(async (ticket) => {
            const payload = ticket.getPayload();
            const username = payload['name'];
            const email = payload['email'];
            
            const sql = 'SELECT * FROM todo WHERE username = ?';

            db.query(sql, [username], async (err, results) => {
                if (err) return res.status(500).send(err);

                // If no user found with that username, create one
                if (results.length === 0) {
                    const insertSQL = 'INSERT INTO todo (username, email) VALUES (?, ?)';
                    db.query(insertSQL, [username, email], (err, result) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).send({ message: "Error registering user" });
                        }
                    });

                    
                }
                res.send({ 
                    success: true, 
                    message: 'Login successful', 
                    user: { username: username, email: email }
                });
            });

        }).catch(err => {
            return res.status(401).send({ message: 'Invalid Google token' });
        });
        return;
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({ message: 'Username and password are required' });
    }

    // 1. Find the user in the database
    const sql = 'SELECT * FROM todo WHERE username = ?';
    
    db.query(sql, [username], async (err, results) => {
        if (err) return res.status(500).send(err);

        // If no user found with that username
        if (results.length === 0) {
            return res.status(401).send({ message: 'Invalid username or password' });
        }

        const user = results[0];

        // 2. Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.send({ 
                success: true, 
                message: 'Login successful', 
                user: { username: user.username, email: user.email }
            });
        } else {
            res.status(401).send({ message: 'Invalid username or password' });
        }
    });
});

app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({ message: 'Username and password are required' });
    }

    // 1. CHECK: Does the user exist?
    const checkSQL = 'SELECT * FROM todo WHERE username = ?';
    
    db.query(checkSQL, [username], async (err, results) => {
        // Handle DB connection errors
        if (err) {
            console.error(err);
            return res.status(500).send({ message: "Database Error" });
        }

        // 2. STOP: If results found, return immediately
        if (results.length > 0) {
            return res.status(409).send({
                success: false,
                message: "Username already exists!"
            });
        }

        // 3. PROCEED: Only runs if results.length === 0
        // We move the entire Hashing + Insert block INSIDE this  query callback
        try {
            const hashedPass = await bcrypt.hash(password, 10);
            const insertSQL = 'INSERT INTO todo (username, email, password) VALUES (?, ?, ?)';

            db.query(insertSQL, [username, email, hashedPass], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send({ message: "Error registering user" });
                }
                
                res.status(201).send({
                    success: true,
                    message: 'User registered successfully'
                });
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: 'Error hashing password' });
        }
    });
});


// ------------------------------------
// API: Todo List (CRUD Operations)
// ------------------------------------

// 1. READ: Get all todos for a specific user
app.get('/api/todos/:username', (req, res) => {
    const { username } = req.params;
    const sql = 'SELECT id, task, done, updated, target_date FROM todo WHERE username = ? ORDER BY TIMEDIFF(target_date, NOW()) DESC';
    db.query(sql, [username], (err, results) => {
        if (err) return res.status(500).send(err);
            res.json(results);
    });
});

// 2. CREATE: Add a new todo item
app.post('/api/todos', (req, res) => {
    const { username, task, target_date } = req.body;
    if (!username || !task) {
        return res.status(400).send({ message: 'Username and task are required' });
    }
    // Note: 'done' defaults to FALSE in the DB schema
    const sql = 'INSERT INTO todo (username, task, target_date) VALUES (?, ?, ?)';
    db.query(sql, [username, task, target_date], (err, result) => {
        if (err) return res.status(500).send(err);
        // Return the created item details including the new ID
        res.status(201).send({ id: result.insertId, username, task, target_date, done: 0, updated: new Date() });
    });
});

// 3. UPDATE: Toggle the 'done' status
app.put('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const { done } = req.body; 
    
    const sql = 'UPDATE todo SET done = ? WHERE id = ?';
    db.query(sql, [done, id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Todo not found' });
        }
        res.send({ message: 'Todo updated successfully' });
    });
});

// 4. DELETE: Remove a todo item
app.delete('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM todo WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Todo not found' });
        }
        res.send({ message: 'Todo deleted successfully' });
    });
});

// Start the server
app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server listening at http://localhost:${process.env.SERVER_PORT}`);
});