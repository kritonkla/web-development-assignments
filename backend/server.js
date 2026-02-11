// server.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { create } = require('domain');

const app = express();

// Middleware setup
app.use(cors()); // Allow cross-origin requests from React frontend
app.use(express.json()); // Enable reading JSON data from request body

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
app.use('/uploads', express.static('uploads'));

app.use(session({
    secret: 'super_secret_key_change_this',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// --- MySQL Connection Setup ---
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER, // CHANGE THIS to your MySQL username
    password: process.env.DB_PASSWORD, // CHANGE THIS to your MySQL password
    database: process.env.DB_NAME // Ensure this matches your database name
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL Database.');
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5001/auth/google/callback"
},
function(accessToken, refreshToken, profile, done) {
    const fullname = (profile.name.givenName) + (profile.name.familyName)
    const email = profile.emails[0].value;
    const username = profile.displayName;
    const photo = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
    const token_id = profile.id

    // A. Check if user exists
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return done(err);

        if (results.length > 0) {
            // User exists! Return them.
            const user = results[0];
            const updateSQL = 'UPDATE users SET profile_url = ? where id = ?';
            db.query(updateSQL, [photo,user.id]);
            return done(null, results[0]);
        } else {
            // User is new! Create them (Password is NULL).
            const sql = 'INSERT INTO users (fullname, username, email, password, profile_url, id_token) VALUES (?, ?, ?, ?, ?, ?)';
            db.query(sql, [fullname, username, email, null, photo, token_id], (err, result) => {
                if (err) return done(err);
                const newUser = { id: result.insertId, fullname: fullname, username: username, email: email , photo: photo, id_token: token_id};
                return done(null, newUser);
            });
        }
    });
  }
));

// Passport Boilerplate
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000' }),
  function(req, res) {
    // Successful authentication, redirect to React app with username
    res.redirect(`http://localhost:3000?username=${encodeURIComponent(req.user.username)}`);
  }
);

app.get('/api/health', (req, res) => {
    return res.status(200).send({message : 'API OK'})
})
// ------------------------------------
// API: Authentication 
// ------------------------------------
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({ message: 'Username and password are required' });
    }

    // 1. Find the user in the database
    const sql = 'SELECT * FROM users WHERE username = ?';
    
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
                user: {id: user.id, username: user.username, email: user.email }
            });
        } else {
            res.status(401).send({ message: 'Invalid username or password' });
        }
    });
});

app.post('/api/signup', async (req, res) => {
    const { fullname, username, email, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({ message: 'Username and password are required' });
    }

    // 1. CHECK: Does the user exist?
    const checkSQL = 'SELECT * FROM users WHERE username = ?';
    
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
            const insertSQL = 'INSERT INTO users (fullname, username, email, password) VALUES (?, ?, ?, ?)';

            db.query(insertSQL, [fullname, username, email, hashedPass], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send({ message: "Error registering user" });
                }
                
                res.status(201).send({
                    success: true,
                    message: 'User registered successfully',
                    user: { id: result.insertId, username: username, email: email }
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


// 2. CREATE: Add a new todo item
app.post('/api/todos', (req, res) => {
    const { username, name, target_date } = req.body;
    if (!username || !name) {
        return res.status(400).send({ message: 'Username and task are required' });
    }

    const sql1 = 'SELECT id from users where username = ?'
    db.query(sql1, [username], (err,result) => {
        if (err) return res.status(500).send(err);

        if(result.length===0) {
            return res.status(404).send({message: "User not found"});
        }

        const user_id = result[0].id;
        console.log(user_id);

        const sql2 = 'INSERT INTO tasks (name,updated,target_date,status,assigned_id) VALUE (?, NOW(), ?, 0, ?)'
        db.query(sql2, [name,target_date,user_id], (err,result) => {
            if (err) return res.status(500).send(err);
            res.status(201).send(
                {
                    id: result.insertId,
                    name: name,
                    target_date: target_date,
                    status: 0,
                    assigned_id : user_id
                }
            );
        });
    });
});

// 3. UPDATE: Toggle the 'done' status
app.put('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 
    
    const sql = 'UPDATE tasks SET status = ? WHERE id = ?';
    db.query(sql, [status, id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'task not found' });
        }
        res.send({ message: 'Task updated successfully' });
    });
});

// 4. DELETE: Remove a todo item
app.delete('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM tasks WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Task not found' });
        }
        res.send({ message: 'Task deleted successfully' });
    });
});

//5. upload profile pic
app.post('/api/upload-avatar', upload.single('avatar'), (req, res) => {
    const { username } = req.body; // We will send the username along with the file
    
    if (!req.file) {
        return res.status(400).send({ message: "No file uploaded" });
    }

    // Construct the URL
    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    // Update the EXISTING user
    const sql = 'UPDATE users SET profile_url = ? WHERE username = ?';
    
    db.query(sql, [avatarUrl, username], (err, result) => {
        if (err) return res.status(500).send(err);
        
        res.send({ 
            success: true, 
            message: 'Image uploaded successfully', 
            avatar_url: avatarUrl 
        });
    });
});


// TEAM APIS
// 1. Create Team and Auto-add Admin
app.post('/api/team/create', (req, res) => {
    const { userid, team_name } = req.body;
    
    if (!userid || !team_name) {
        return res.status(400).send({ message: "userid/team_name required" });
    }

    const create_team_sql = 'INSERT INTO teams (name, admin_id) VALUES (?, ?)';

    // Query 1: Create the Team
    db.query(create_team_sql, [team_name, userid], (err, result) => {
        if (err) return res.status(500).send(err);

        // CAPTURE THE NEW TEAM ID
        // The 'result' object contains 'insertId', which is the ID of the row just created
        const newTeamId = result.insertId;

        // Query 2: Add the Admin to the user_team table
        const add_admin_sql = 'INSERT INTO user_team (user_id, team_id) VALUES (?, ?)';

        db.query(add_admin_sql, [userid, newTeamId], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }

            res.status(201).send({
                success: true,
                message: 'Team created and admin added successfully',
                team_name: team_name,
                team_id: newTeamId
            });
        });
    });
});
//2.add member to team
app.post('/api/team/add-member', (req,res) => {
    const {userid, teamid} = req.body;
    if (!userid || !teamid) {
        return res.status(400).send({message: "userid/team_id required"});
    }

    const add_member_sql = 'INSERT INTO user_team (user_id, team_id) VALUES (?, ?)';

    db.query(add_member_sql, [userid,teamid], (err, result) => {
        if (err) return res.status(500).send(err);

        res.send({
            success:true,
            message: 'Member added successfully',
            userid : userid,
            teamid : teamid
        });
    });
});

//4. delete member from team
app.post('/api/team/del-member', (req,res) => {
    const {userid, teamid} = req.body;
    if (!userid || !teamid) {
        return res.status(400).send({message: "userid/team_id required"});
    }

    const del_member_sql = 'DELETE FROM user_team WHERE user_id = ? AND team_id = ?';

    db.query(del_member_sql, [userid,teamid], (err, result) => {
        if (err) return res.status(500).send(err);

        res.send({
            success:true,
            message: 'Member deleted successfully',
            userid : userid,
            teamid : teamid
        });
    });
});

//3. retrive all user from db
app.get('/api/get-users', (req, res) => {
    const sql = 'SELECT * from users';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
            res.json(results);
    });
});

// retrive all team for user
app.post('/api/get-team', (req, res) => {
    const {userid} = req.body
    const sql = 'SELECT * FROM user_team INNER JOIN teams ON user_team.team_id = teams.id WHERE user_id = ?';
    db.query(sql, [userid], (err, results) => {
        if (err) return res.status(500).send(err);
            res.json(results);
    });
});


//5. add task to team
app.post('/api/team/add-task', (req, res) => {
    const { task, target_date,status, assigned_id, team_id } = req.body;
    if (!assigned_id || !task || !team_id) {
        return res.status(400).send({ message: 'assigned_id and task and teamid are required' });
    }
    const sql = 'INSERT INTO tasks (name, updated, target_date, status, assigned_id, team_id) VALUES (?, NOW(), ?, 0, ?, ?)';
    db.query(sql, [task,  target_date ,assigned_id,team_id], (err, result) => {
        if (err) return res.status(500).send(err);
        // Return the created item details including the new ID
        res.status(201).send({ id: result.insertId, task, target_date, done: 0, updated: new Date(), assigned_id : assigned_id });
    });
});

//6. retrieve tasks 
app.get('/api/todos/:username', (req, res) => {
    const { username } = req.params;
    const retrieve_sql = 'SELECT tasks.id, username, name, status, updated, target_date,profile_url FROM users INNER JOIN tasks ON tasks.assigned_id = users.id WHERE username = ? ORDER BY TIMEDIFF(target_date, NOW()) DESC; '
    db.query(retrieve_sql, [username], (err, results) => {
        if (err) return res.status(500).send(err);
            res.json(results);
    });
});

// 7. Get All Members of a specific Team (for Admin to list or assign tasks)
app.get('/api/team/:teamid/members', (req, res) => {
    const { teamid } = req.params;
    const sql = `
        SELECT users.id, users.username, users.profile_url 
        FROM user_team 
        JOIN users ON user_team.user_id = users.id 
        WHERE user_team.team_id = ?`;
    
    db.query(sql, [teamid], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// 8. Get All Tasks for a specific Team (User & Admin view)
app.get('/api/team/:teamid/tasks', (req, res) => {
    const { teamid } = req.params;
    const sql = `
        SELECT tasks.*, users.username as assignee_name, users.profile_url as assignee_pic 
        FROM tasks 
        LEFT JOIN users ON tasks.assigned_id = users.id 
        WHERE tasks.team_id = ? 
        ORDER BY target_date ASC`;
        
    db.query(sql, [teamid], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.get('/api/get-pic/:username', (req,res) => {
    const {username} = req.params;
    const retrieve_pic_sql = 'SELECT profile_url FROM users WHERE username = ?;';
    db.query(retrieve_pic_sql, [username], (err,results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server listening at http://localhost:${process.env.SERVER_PORT}`);
});