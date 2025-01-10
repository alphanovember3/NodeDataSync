const restify = require('restify');
const server = restify.createServer();
const connection = require('./mongoConnection');
const connectionsql1 = require('./sqlConnection');
const { v4: uuidv4 } = require('uuid');
const Redis = require("ioredis");
server.use(restify.plugins.bodyParser());
const { Client } = require('@elastic/elasticsearch')
const { faker } = require('@faker-js/faker');
const createbulkreportsql = require('./utils');


//database connection mongoDB
let db;
connection().then(async (database) => {
    db = database;
    //starting server after DB connection 
    server.listen(process.env.PORT, process.env.IP_PORT, () => {
        console.log("server running on port 8080");
    });
});

//SQL ROUTESl
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
    return res.send(201, user);
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
    return res.send("User Updated")
})

//delete the user in mongoDB
server.del('/mongo/delete/:id', async (req, res) => {
    const id = req.params.id;
    const usercollection = db.collection("users");
    await usercollection.deleteOne({ id: id });
    return res.send("User deleted");
})

//Show all users in mongoDB
server.get('/mongo/get', async (req, res) => {
    const usercollection = db.collection("users");
    const allusers = await usercollection.find().toArray();
    return res.send(allusers);
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

//bulk data find ELASTIC 

server.get('/elastic/getbulkdata/:gender/:zsign', async (req, res) => {
    // const index = req.params.index;
    const gender = req.params.gender;
    const zsign = req.params.zsign;
    const response = await client.search({
        index: 'ayush-detail',
        body: {
            query:
            {
                bool: {
                    must: [

                        { term: { gender: gender } },
                        { term: { zsign: zsign } }

                    ]
                }
            }
        }
    });

    return res.send(response);
})

//Bulk data insert into mongo

server.post('/mongo/createbulk', async (req, res) => {

    let data = [];
    for (let i = 0; i < 1000000; i++) {

        const firstName = faker.person.firstName()
        const lastName = faker.person.lastName()
        const jobType = faker.person.jobType()
        const country = faker.location.country()
        const gender = faker.person.sex()
        const zodiacSign = faker.person.zodiacSign()
        const timeStamp = new Date().valueOf()
        data.push({ firstName, lastName, jobType, country, gender, zodiacSign, timeStamp });
    }


    const usercollection = db.collection("bulkdata");

    //ordered:true is send as option which will ensure that if one data fail to add other should be added
    await usercollection.insertMany(data, { ordered: true });
    return res.send("Bulk Data Added Successfully");

})
//getting bulkdata from mongo using filters
server.get('/mongo/getbulkdata/:gender/:zsign/:country', async (req, res) => {

    const zsign = req.params.zsign;
    const gender = req.params.gender;
    const country = req.params.country;
    const usercollection = db.collection('bulkdata');
    const resultdata = await usercollection.find({ country: country, gender: gender, zodiacSign: zsign }).toArray();
    return res.send(resultdata);
})

//Creating Bulk data into Mysql
server.post('/mysql/createbulk', async (req, res) => {
    const connectionsql = await connectionsql1;

    //This function is created to generate 10000 data at a time in array
    function createbulksql(){
        let data = [];
    for (let i = 0; i < 10000; i++) {
        const firstName = faker.person.firstName()
        const lastName = faker.person.lastName()
        const country = faker.location.country()
        const gender = faker.person.sex()
        const zodiacSign = faker.person.zodiacSign()
        const timeStamp = new Date().valueOf()
        data.push([firstName, lastName, country, gender, zodiacSign, timeStamp]);

    }
    return data;
    }
    
    for(let i=0;i<100;i++){
        //we will get a array from the above function and we will put that array data in mysql
        const data1 = createbulksql();
        const query = 'INSERT INTO bulkdata (firstName, lastName, country,gender,zodiacSign,timeStamp) VALUES ?';
        connectionsql.query(query, [data1], (err, result) => {
            if (err) {
               return res.json({err});
            }
        })
    }

    return res.send("Data Inserted Successfully Into Mysql");
})

//Get BulkData from Mysql using filters

server.get('/mysql/getbulk/:gender/:zsign/:country',async(req,res)=>{
    const connectionsql = await connectionsql1;
    const gender = req.params.gender;
    const zsign = req.params.zsign;
    const country = req.params.country;
    const [data] = await connectionsql.query("SELECT * FROM bulkdata WHERE gender=? AND zodiacSign=? AND country =? LIMIT 10",[gender,zsign,country])

    res.send(data);
})


//Creating summarise report of data in campaign into Mysql
server.post('/mysql/report', async (req, res) => {
    const connectionsql = await connectionsql1;

    //This function is created to generate 10000 data at a time in array
    function createbulksql(){
        let data = [];
    for (let i = 0; i < 1000; i++) {
        const firstName = faker.person.firstName()
        const lastName = faker.person.lastName()
        const campaign = 'campaign3'
        const logIn =  Date.now()
        const logOut =  Date.now() + 80000000 
        data.push([firstName, lastName, campaign, logIn,logOut]);

    }
    return data;
    }
    
    for(let i=0;i<10;i++){
        //we will get a array from the above function and we will put that array data in mysql
        const data1 = createbulksql();
        const query = 'INSERT INTO reportdata (firstName, lastName, campaign,logIn,logOut) VALUES ?';
        connectionsql.query(query, [data1], (err, result) => {
            if (err) {
               return res.json({err});
            }
        })
    }

    return res.send("Data Inserted Successfully Into Mysql");
})




server.get('/mysql/getreport',async(req,res)=>{
    const connectionsql = await connectionsql1;

    const [data] = await connectionsql.query("SELECT campaign, COUNT(*) AS user_count, AVG(logIn) AS avg_login, AVG(logOut) AS avg_logout,AVG(logOut)-AVG(logIn) AS WorkingTime FROM reportdata GROUP BY campaign")

    res.send(data);
})

server.post('/mysql/callreport/create',async(req,res)=>{
    
    for(let i=0;i<10;i++){
        //we will get a array from the above function and we will put that array data in mysql
        //createbulkreportsql function imported from utils file
        const data1 = createbulkreportsql();
        const connectionsql = await connectionsql1;
        const query = 'INSERT INTO callerreport (datetime,calltype,disposeType,callDuration,agentName,campaignName,processName,leadsetId,referenceUuid,customerUuid,holdTime,muteTime,ringingTime,transferTime,conferenceTime,callTime,disposeTime,disposeName) VALUES ?';
        connectionsql.query(query, [data1], (err, result) => {
            if (err) {
               return res.json({err});
            }
        })
    }

    return res.send("Call Report Data Inserted Successfully Into Mysql");

})


server.get('/mysql/callreport/get',async(req,res)=>{

    const connectionsql = await connectionsql1;

    // const [data] = await connectionsql.query("SELECT campaignName, COUNT(*) AS Total_Calls, COUNT(* WHERE calltype = 'Dispose') AS Call_Answered FROM callerreport GROUP BY campaignName")
    const [data] = await connectionsql.query(`
        SELECT 
         
          COUNT(*) AS Total_Calls,
          HOUR(datetime) AS Call_Hour,
          SUM(CASE WHEN calltype = 'Dispose' THEN 1 ELSE 0 END) AS Call_Answered,
          SUM(CASE WHEN calltype = 'Missed' THEN 1 ELSE 0 END) AS Missed_Calls,
          SUM(CASE WHEN calltype = 'Autodrop' THEN 1 ELSE 0 END) AS Call_Autodrop, 
          SUM(CASE WHEN calltype = 'Autofail' THEN 1 ELSE 0 END) AS Call_Autofail, 
          SUM(callDuration) AS Talktime 
        FROM 
          callerreport 
        GROUP BY 
         HOUR(datetime)
      `);
      
    res.send(data);

})