const restify = require('restify');
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

const Mysqlroutes = require('./Routes/Mysql');
const elasticRoutes = require("./Routes/ElasticSearch")
const mongoRoutes = require("./Routes/Mongodb")
const redisRoutes = require("./Routes/Redis")



//All Routes:

Mysqlroutes(server);
elasticRoutes(server);
mongoRoutes(server);
redisRoutes(server);

//server listening on port 8080
server.listen(process.env.PORT, process.env.IP_PORT, () => {
            console.log("server running on port 8080");
     });
