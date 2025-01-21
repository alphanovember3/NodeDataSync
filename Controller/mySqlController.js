const connectionsql1 = require('../Connections/sqlConnection');
const createbulkreport = require('../Utils/utils');
const connection = require('../Connections/mongoConnection');
const client = require("../Connections/elasticConnection");

let db;
connection().then(async (database) => {
    db = database;
});


//functions for the SQLRoutes:

const summaryReport = async(req,res)=>{

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

}


const mySqlAllData = async(req,res)=>{

    const connectionsql = await connectionsql1;

    // const [data] = await connectionsql.query("SELECT campaignName, COUNT(*) AS Total_Calls, COUNT(* WHERE calltype = 'Dispose') AS Call_Answered FROM callerreport GROUP BY campaignName")
    const [data] = await connectionsql.query(`SELECT * FROM callerreport LIMIT 5000`);
      
    res.send(data);

}


const createReportData = async(req,res)=>{
    
    for(let i =0;i<10000;i++){

        //creating bulk data for Elastic
        const obj = await createbulkreport('elastic');
        
        const response = await client.bulk({ body: obj.data3 });

        //creating bulk data for Mongo

        const usercollection = db.collection("bulkCallingReport");
        
        await usercollection.insertMany(obj.data2, { ordered: true });

        //Creating bulk data for sql
        const connectionsql = await connectionsql1;
        const query = 'INSERT INTO callerreport (datetime,calltype,disposeType,callDuration,agentName,campaignName,processName,leadsetId,referenceUuid,customerUuid,holdTime,muteTime,ringingTime,transferTime,conferenceTime,callTime,disposeTime,disposeName) VALUES ?';
        connectionsql.query(query, [obj.data1], (err, result) => {
            if (err) {
               return res.json({err});
            }  
        })

        
    }
    // res.send(obj.data1);
    return res.send("data inserted successfully into the all")
}


module.exports = {
    summaryReport,
    mySqlAllData,
    createReportData

}