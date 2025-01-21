const redis = require('../Connections/redisConnection');



//Redis Routes

const redisRoutes = (server)=>{
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
}


module.exports = redisRoutes;