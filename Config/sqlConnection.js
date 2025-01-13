
const mysql = require('mysql2/promise');



const connectionsql =  mysql.createConnection({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PSWD,
    database: process.env.SQL_DB
});



module.exports = connectionsql;