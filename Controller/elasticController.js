
//elastic connection
const client = require("../Connections/elasticConnection");

const allReportData = async(req,res)=>{

    const response = await client.search({
             index: 'ayush',
             body:{
                "size":10000,
                query:{
                    match_all:{}
                }
             } 
            
    }); 
    const dataArray = response.hits.hits.map(hit => hit._source); 
    return res.send(dataArray);

}

const summaryReportData = async (req, res) => {
    try {
      const result = await client.search({ 
        index: 'ayush', 
        body: { 
         
          aggs: { 
            by_hour: { 
              date_histogram: { 
                field: 'datetime', 
                fixed_interval: '1h' 
              },
                  aggs: {
                      call_count: { 
                          value_count: { 
                            field: 'datetime' 
                          } 
                        },
                      AnsweredCount: {
                          "filter": { "term": { "calltype.keyword" : "Dispose" } },
                          "aggs": {
                              call_count: { 
                                  value_count: { 
                                    field: 'datetime' 
                                  } 
                                }
                          }
                      }, 
                      dropCount: {
                          "filter": { "term": { "calltype.keyword" : "Autodrop" } },
                          "aggs": {
                              call_count: { 
                                  value_count: { 
                                    field: 'datetime' 
                                  } 
                                }
                          }
                      },
                      failCount: {
                          "filter": { "term": { "calltype.keyword" : "Autofail" } },
                          "aggs": {
                              call_count: { 
                                  value_count: { 
                                    field: 'datetime' 
                                  } 
                                }
                          }
                      },
                      missedCount: {
                          "filter": { "term": { "calltype.keyword" : "Missed" } },
                          "aggs": {
                              call_count: { 
                                  value_count: { 
                                    field: 'datetime' 
                                  } 
                                }
                          }
                      },
                    Talktime: { 
                      sum: { field: 'callDuration' } 
                  },     
              } 
            } 
          }, 
          size: 0 ,
        } 
      });
  
      const resultarray = await result.aggregations.by_hour.buckets;
      
      res.send(resultarray);
    } catch (error) {
      console.error(error);
      res.send(error);
     
    }
  }

module.exports = {allReportData,summaryReportData}