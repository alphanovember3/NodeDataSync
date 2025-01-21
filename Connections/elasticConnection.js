const dotenv = require("dotenv");
dotenv.config();
const { Client } = require('@elastic/elasticsearch')  



//elastic connection
const client = new Client({
    node: process.env.ELASTIC_IP
})


module.exports = client;