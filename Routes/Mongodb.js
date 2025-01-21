const {allReportData,
    summaryReportData
} = require("../Controller/mongoController")


//Mongo DB Rotes

const mongoRoutes = (server)=>{

    //sending all the data as it is from Mongo for fontend 
    server.get('/mongo/callreport/getall',allReportData)
    
    //Getting summarise report of calling data
    server.get('/mongo/callreportSummary/get',summaryReportData)

}    

module.exports = mongoRoutes;