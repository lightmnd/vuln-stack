const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: "mysql",
    user: "root",
    password: "example",
    database: "vuln_app",
    port: 3306
});

db.connect(err => {
    if (err) {
        console.error('❌ Errore connessione MySQL:', err.message);
        process.exit(1)
    };
    console.log("Connected to MySQL");
});

// SQL Injection vulnerability
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
    db.query(query, (err, result) => {
        if (err) return res.status(500).send("DB Error");
        if (result.length > 0) res.send("Welcome!");
        else res.status(401).send("Invalid credentials");
    });
});

// XSS vulnerable API
app.get('/comment', (req, res) => {
    const comment = req.query.q;
    res.send(`<html><body>Comment: ${comment}</body></html>`);
});

app.get('/user', (req, res) => {
    const name = req.query.name;
    db.query(`SELECT * FROM users WHERE name = '${name}'`, (err, result) => {
        if (err) return res.status(500).send("SQL Error");
        res.json(result);
    });
});


const PORT = process.env.PORT || 4000;

app.listen(4000, '0.0.0.0', () => {
    console.log("✅ Server Express in ascolto su porta 4000");
});
