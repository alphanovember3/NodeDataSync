const {summaryReport,
    mySqlAllData,
    createReportData,
} = require('../Controller/mySqlController')



//SQL ROUTESl
const sqlRoutes = (server)=>{

//Route for getting Summary report in Mysql
server.get('/mysql/callreportSummary/get',summaryReport)

//sending all the data as it is from MYSQL for fontend 
server.get('/mysql/callreport/getall',mySqlAllData);


//creating the the report data for elastic sql and mongo at sametime
server.post('/all/callreport/createall',createReportData)




}


module.exports =sqlRoutes;
