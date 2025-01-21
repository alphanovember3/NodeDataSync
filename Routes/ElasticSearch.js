
const {allReportData,summaryReportData} = require("../Controller/elasticController")


//Elastic Search Routes

const elasticRoutes = (server)=>{
    
    //sending all the data as it is from Elastic for fontend 
    server.get('/elastic/callreport/getall',allReportData);
    
    //Getting summarise report of calling data from Elastic Search 
    server.get('/elastic/callreportSummary/get',summaryReportData);

}


module.exports = elasticRoutes;


