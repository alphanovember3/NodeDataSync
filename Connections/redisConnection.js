require('dotenv').config();
const Redis = require("ioredis");
//Redis connection 
const redis = new Redis({ 
    port: process.env.REDIS_PORT, 
    host: process.env.REDIS_IP 
 });

module.exports = redis;