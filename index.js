const restify = require('restify');
const server = restify.createServer();
const connection = require('./mongoConnection');
const connectionsql1 = require('./sqlConnection');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const Redis = require("ioredis");
server.use(restify.plugins.bodyParser());
const { Client } = require('@elastic/elasticsearch')
const { faker } = require('@faker-js/faker');


//database connection mongoDB
let db;
connection().then(async (database) => {
    db = database;
    //starting server after DB connection 
    server.listen(process.env.PORT, process.env.IP_PORT, () => {
        console.log("server running on port 8080");
    });
});

//SQL ROUTES
//Sql show users Get  
server.get('/mysql/get', async (req, res) => {
    const connectionsql = await connectionsql1;
    const [data] = await connectionsql.execute('SELECT * FROM users LIMIT 10');
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
        id: uuidv4(),
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
server.put('/mongo/update/:id', async (req, res) => {
    const id = req.params.id;
    const user = {
        name: req.body.name,
        email: req.body.email
    }
    const usercollection = db.collection("users");
    await usercollection.updateOne({ id: id }, { $set: user });
    res.send("User Updated")
    return;
})

//delete the user in mongoDB
server.del('/mongo/delete/:id', async (req, res) => {
    const id = req.params.id;
    const usercollection = db.collection("users");
    await usercollection.deleteOne({ id: id });
    res.send("User deleted");
    return;
})

//Show all users in mongoDB
server.get('/mongo/get', async (req, res) => {
    const usercollection = db.collection("users");
    const allusers = await usercollection.find().toArray();
    res.send(allusers);
    return;
})

//Redis Routes
//Redis connection 
const redis = new Redis({ port: process.env.REDIS_PORT, host: process.env.REDIS_IP });
//Create the new user
server.post('/redis/create/:hashkey', async (req, res) => {

    let hashkey = req.params.hashkey;
    await redis.hset(
        hashkey, {
        'name': req.body.name,
        'email': req.body.email
    }
    )
    return res.send("data submitted to Redis")
});

//update the existing user data
server.put('/redis/update/:hashkey', async (req, res) => {

    let hashkey = req.params.hashkey;
    await redis.hset(
        hashkey, {
        'name': req.body.name,
        'email': req.body.email
    }
    )
    return res.send("data updated to Redis")
});

//to show users from redis
server.get('/redis/get/:hashkey', async (req, res) => {
    //hashkey name = userAyush1
    let hashkey = req.params.hashkey;
    const response = await redis.hgetall(hashkey);
    return res.send(response);
});

//to delete user data from redis
server.del('/redis/delete/:hashkey', async (req, res) => {
    let hashkey = req.params.hashkey;
    await redis.del(hashkey);
    return res.send("successfully Deleted data from Redis");
});


//Elastic Search Routes
//elastic connection
const client = new Client({
    node: process.env.ELASTIC_IP
})

//To create data into elastic
server.post('/elastic/create/', async (req, res) => {
    await client.index({
        index: req.body.index,
        id: req.body.id,
        document: {
            name: req.body.name,
            lastname: req.body.lastname,
        },
    });
    return res.send("data submitted to Elastic")
});

//To show data from elasticSearch 
server.get('/elastic/get/:index', async (req, res) => {
    const index = req.params.index;
    const response = await client.search({ index: index });
    return res.send(response);
})

//update the elastic data 
server.put('/elastic/update/:index/:id', async (req, res) => {
    const index = req.params.index;
    const id = req.params.id;
    const data = req.body;
    const result = await client.update({
        index: index,
        id: id,
        doc: data,
    });
    res.json(result);
})

//delete the data from elastic
server.del('/elastic/delete/:index/:id', async (req, res) => {
    const index = req.params.index;
    const id = req.params.id;
    await client.delete({ index: index, id: id });
    return res.send("data deleted successfully");
})


//To create fake data into elastic
server.post("/elastic/createbulk", async (req, res) => {
    let bulkData = [];
    for (let i = 0; i < 500000; i++) {
        const firstname = faker.internet.username();
        const lastname = faker.internet.username();
        const email = faker.internet.email();
        //   const password = faker.internet.password();
        const timestamp = new Date().toLocaleTimeString();
        const gender = faker.person.sex();
        const zsign = faker.person.zodiacSign();
        const country = faker.location.country();

        bulkData.push({ index: { _index: 'ayush-detail' } });
        bulkData.push({ firstname, lastname, email, timestamp, gender, zsign, country });
    }

    try {
        const response = await client.bulk({ body: bulkData });
        if (response.errors) {
            res.json({
                message: "Failed to save some or all documents",
                error: response.errors
            });
        } else {
            res.json({
                message: "Successfully Added",
                data: response
            });
        }
    } catch (error) {
        res.json({ message: "Failed to save", error: error })
    }
})

//bulk data find

server.get('/elastic/getbulkdata/:gender/:zsign', async (req, res) => {
    // const index = req.params.index;
    const gender = req.params.gender;
    const zsign = req.params.zsign;
    const response = await client.search({
        index: 'ayush-detail',
        body: {
            query:
            {
                bool:{
                    must:[

                        {term: { gender: gender }},
                        {term: { zsign: zsign }}
                        
                    ]
                }
            }
        }
    });

    return res.send(response);
})