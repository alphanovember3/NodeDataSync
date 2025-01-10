const { v4: uuidv4 } = require('uuid');

//This file has the functions which are required in main index file

    function createbulkreportsql(){

        let data = [];
        let cType = ['Dispose','Missed','Autofail','Autodrop'];
        let disType = ['Callback','Dnc','Etx'];
        let agentN = ['Suraj','Vishal','Loukik','Aniket','Naman','Miraj','Salar','Parth','Riya','Dhruvi'];
        let campignN = ['Marketing','Sales','Product_Promotion']
        let processN = ['Process1','Process2','Process3']
        let disposeN = ['External Transfer','Do Not Call','Follow Up']

    

    for (let i = 0; i < 1000; i++) {

        // let random=  Math.floor(Math.random() * (9 - 0 + 1)) + 0;

        let datetime = `2025-01-01 ${Math.floor(Math.random() * ( 15- 9 + 1)) + 9}:${Math.floor(Math.random() * ( 50- 10 + 1)) + 10}:${Math.floor(Math.random() * ( 50- 10 + 1)) + 10}`;

        let calltype = cType[Math.floor(Math.random() * (3 - 0 + 1)) + 0];
        let disposeType;
        if(calltype == 'Dispose'){
            
             disposeType = disType[Math.floor(Math.random() * (2 - 0 + 1)) + 0]
        }
        else{
             disposeType = 'Null';
        }

        let disposeName = disposeN[Math.floor(Math.random() * (2 - 0 + 1)) + 0];

        let agentName = agentN[Math.floor(Math.random() * (9 - 0 + 1)) + 0];
        
        let campaignName = campignN[Math.floor(Math.random() * (2 - 0 + 1)) + 0];
        
        let processName = processN[Math.floor(Math.random() * (2 - 0 + 1)) + 0];

        let leadsetId = uuidv4();

        let referenceUuid = uuidv4();
        let customerUuid = uuidv4();
        let holdTime, muteTime, ringingTime, transferTime, conferenceTime, callTime, disposeTime;
        if(calltype == 'Dispose' ){

            holdTime =  Math.floor(Math.random() * (480 - 0 + 1)) + 0;
            muteTime =  Math.floor(Math.random() * (480 - 0 + 1)) + 0;
            ringingTime =  Math.floor(Math.random() * (60 - 0 + 1)) + 0;
            transferTime =  Math.floor(Math.random() * (300 - 0 + 1)) + 0;
            conferenceTime =  Math.floor(Math.random() * (3080 - 0 + 1)) + 0;
            callTime =  Math.floor(Math.random() * (3000 - 5 + 1)) + 5;
            disposeTime =  Math.floor(Math.random() * (30 - 5 + 1)) + 5;
                 
        }
        else{
            
             holdTime = 0; 
             muteTime = 0;
             ringingTime =Math.floor(Math.random() * (60 - 0 + 1)) + 0;
             transferTime = 0;
             conferenceTime = 0;
             callTime = 0;
             disposeTime = 0;
        }
        
        let callDuration =  (holdTime + muteTime +  ringingTime +  transferTime  + conferenceTime + callTime  ); 
        
        


        data.push([datetime,calltype,disposeType,callDuration,agentName,campaignName,processName,leadsetId ,referenceUuid,customerUuid,holdTime ,muteTime ,ringingTime ,transferTime,conferenceTime, callTime,disposeTime,disposeName ]);

    }
    return data;
    }

    module.exports = createbulkreportsql; 