const restify = require('restify');
const server = restify.createServer();
const connection = require('./connection');
const connectionsql1 = require('./sqlconnection');
const mysql = require('mysql2/promise');
server.use(restify.plugins.bodyParser());
const { v4: uuidv4 } = require('uuid');
// const { createClient } = require('redis'); 
const Redis = require("ioredis");

// const redis = require('redis');


//database connection mongoDB
let db;
connection().then(async (database) => {
    db = database;
    //starting server after DB connection 
    server.listen(process.env.PORT,process.env.IP_PORT, () => {
    console.log("server running on port 8080");
    });
});

//SQL ROUTES
//Sql show users Get  
server.get('/mysql/get', async (req, res) => {
    const connectionsql = await connectionsql1;
    const [data] = await connectionsql.execute('SELECT * FROM users');
    // let toshow = await showuser.toArray();
    // console.log(toshow); 
    res.send(data);
});

//user saving in SQL dB
server.post('/mysql/create', async (req, res) => {
    const sqluser = {
        name: req.body.name,
        email: req.body.email
    };
    const connectionsql = await connectionsql1;
    await connectionsql.execute('INSERT INTO users (name, email) VALUES (?, ?)', [sqluser.name, sqluser.email]);
    console.log("User saved to sql database");
    res.send(201, sqluser);
    return;
});

//updating the user into MYSQL
server.put('/mysql/update/:id', async (req, res) => {
    const sqluser = {
        name: req.body.name,
        email: req.body.email
    };
    const connectionsql = await connectionsql1;
    await connectionsql.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', [sqluser.name, sqluser.email, req.params.id]);
    console.log("User updated in sql database");
    res.send(200, sqluser);
    return;
});

//Deleting the user into MYSQL
server.del('/mysql/delete/:id', async (req, res) => {

    const connectionsql = await connectionsql1;
    await connectionsql.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    console.log("User deleted in sql database");
    res.send(200, "user deleted");

});

//Mongo DB Rotes
// Create a user and save it in MONGO
server.post('/mongo/create', async (req, res) => {
    const user = {
        id:uuidv4(),
        name: req.body.name,
        email: req.body.email
    };
    const usercollection = db.collection("users");
    await usercollection.insertOne(user);
    console.log("Message saved to database");
    res.send(201, user);
    return;
});

//update the user in MONGO
server.put('/mongo/update/:id', async(req,res)=>{
    const id = req.params.id;
    const user={
        name:req.body.name,
        email:req.body.email
    }
    const usercollection = db.collection("users");
    await usercollection.updateOne({ id: id },{ $set: user });
    res.send("User Updated")
    return;
})

//delete the user in mongoDB
server.del('/mongo/delete/:id',async (req,res)=>{
    const id = req.params.id;
    const usercollection = db.collection("users");
    await usercollection.deleteOne({id:id});
    res.send("User deleted");
    return;
})

//Show user all users in mongoDB
server.get('/mongo/get',async (req,res)=>{
    const usercollection = db.collection("users");
    const allusers = await usercollection.find().toArray();
    res.send(allusers);
    return;
})

//Redis connection 

const redis = new Redis({port:process.env.REDIS_PORT,host:process.env.REDIS_IP});

// const client = createClient({ url:'192.168.0.94:6379'});

server.post('/redis/create', async (req,res)=>{

    
    await redis.hset(
        'userayush2',{
            'name': req.body.name,
        'email': req.body.email
        }
    )
    res.send("succss")
})

//to get from redis
server.get('/redis/get',async (req,res)=>{
    const response = await redis.hgetall('userayush');

    res.send(response);
})
