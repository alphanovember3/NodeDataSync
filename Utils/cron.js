const { CronJob } = require('cron') ;

//Will use the cron to send the reports to the client after some interval

const job = new CronJob(
	'* * * * * *', // cronTime
	function () {
		console.log('Logging the message for every second using cronTime');    
	}, // onTick
	null, // onComplete
	true, // start
	'America/Los_Angeles' // timeZone
);
