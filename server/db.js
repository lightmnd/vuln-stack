const mysql = require('mysql');
require('dotenv').config();
const mySqlUrl = !process.env.NODE_ENV === 'development' ? "mysql" : "127.0.0.1";

const db = mysql.createConnection({
    host: process.env.DB_HOST || mySqlUrl,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "example",
    database: process.env.DB_NAME || "vuln_app",
    port: process.env.MYSQL_PORT || 3306
});

module.exports = db