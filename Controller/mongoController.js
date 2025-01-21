//connection part mongoDB
const connection = require('../Connections/mongoConnection');
let db;
connection().then(async (database) => {
    db = database;
});

//functions for routes:


const allReportData = async(req,res)=>{

    const usercollection = await db.collection("bulkCallingReport");

    const resultdata = await usercollection.find().toArray();
    res.send(resultdata);

}

const summaryReportData = async(req,res)=>{
        
    const collection = db.collection('bulkCallingReport');

    const result = await collection.aggregate([
   
    {
        $addFields: {
          hour: { $hour: { $dateFromString: { dateString: { $dateToString: { format: "%Y-%m-%dT%H:%M:%S.%L", date: "$datetime" } } } } }
        }
      },

      {
        $group: {
          _id: "$hour",
          Talktime: { $sum: "$callDuration" },
          Total_Calls: { $sum: 1 },
          Call_Answered: {$sum :{$cond:[{$eq: ["$calltype","Dispose"]},1,0]}}, 
          Missed_Calls: {$sum :{$cond:[{$eq: ["$calltype","Missed"]},1,0]}} ,
          Call_Autodrop: {$sum :{$cond:[{$eq: ["$calltype","Autodrop"]},1,0]}}, 
          Call_Autofail: {$sum :{$cond:[{$eq: ["$calltype","Autofail"]},1,0]}} 
        }
      },
      {
        $sort: { _id: 1 } // Sort by hour
      }
    ]).toArray();

return res.send(result)

}

//exporting the functions 
module.exports = {allReportData,summaryReportData}