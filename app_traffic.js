var builder = require('botbuilder');
var express = require('express');
var request = require('superagent');

var app = express();

var connector = new builder.ChatConnector().listen();

app.listen(process.env.PORT || 3978, function () {
   console.log('%s listening to %s', app.name, app.url); 
});

var connector = new builder.ChatConnector({
    appId: 'ab630e04-693a-4293-ade0-4cd6cd6a4894',
    appPassword: 'WdbNTc1edXZYkw0eeZNkYrv'
});

 
	app.post('/api/messages', connector.listen());
	
var bot = new builder.UniversalBot(connector, [
    
    function (session) {
        session.send("Welcome to the trouble ticket service");
	   builder.Prompts.choice(session, "please select the the service you wish to call", "Create Ticket|Get Ticket Details", { listStyle: builder.ListStyle.button });
    },
	function (session, results) {
        session.dialogData.choice1 = results.response;
		var choice = session.dialogData.choice1.entity;
		console.log("choice"+choice);
		if(choice=='Create Ticket')
			session.beginDialog('askForCreateTicketDetails');

		else {
			session.beginDialog('askForGetTicketDetails');
			 }
    }
	]);
	
	bot.dialog('askForGetTicketDetails', [
    function (session) {
        builder.Prompts.text(session, "Please provide the ticket id");
		
    },
    function (session, results) {
        session.dialogData.gTicketID = results.response;
			request
	.get('https://api-uat.tatacommunications.com:443/testBotService/tickets/' + session.dialogData.gTicketID)
			.send()
			.set('Accept', 'application/json')
			.set('Content-Type', 'application/json')
			.end(function(err, res){
			if (err || !res.ok) {
			session.send('Oh no! error. Please try again!');
			session.endDialog();

			} else {
			var response = res.body;
			var ticket = response.ticket;
			var ticketId = ticket.id;
			var date = ticket.date;
			var category = ticket.ticketCategory;
			var originIP = category.originIP;
			var destinationIP = category.destIP;
			
			
					session.send("Ticket details are as follows: "+"<br/>ticket ID: "+ticketId+"<br/>Date: "+date+"<br/>Origin IP: "+originIP+"<br/>Destination IP: "+destinationIP+"<br/>Thank you for using the service");
					session.endDialog();
					}
					});
		
    }
]);

	bot.dialog('askForCreateTicketDetails', [
    function (session) {
        builder.Prompts.text(session, "Please provide a brief description of the Traffic IP ticket?");
    },
    function (session, results) {
		session.dialogData.cDescription = results.response;
        builder.Prompts.choice(session, "what is the severity of the problem?", "Major - (Outage)|Minor - (Impact)", { listStyle: builder.ListStyle.button });
    },
	function (session, results) {
		session.dialogData.cSeverity = results.response; 
		var severe = session.dialogData.cSeverity.entity;
		builder.Prompts.text(session, "Please provide the Origin IP");	
	},
	function (session, results) {
		session.dialogData.cOriginIP = results.response;
		builder.Prompts.text(session, "Please provide the Destination IP");	
	},
	function (session, results) {
		session.dialogData.cDestinationIP = results.response;
		session.send(`Create Ticket Details: <br/>Description: ${session.dialogData.cDescription} <br/>Severity: ${session.dialogData.cSeverity.entity} <br/>OriginIP: ${session.dialogData.cOriginIP} ,<br/>Destination IP: ${session.dialogData.cDestinationIP}`);
		builder.Prompts.confirm(session, "Are you sure you wish to create a ticket?");
	},
	function (session, results) {
		session.dialogData.confirm1 = results.response;
		if(session.dialogData.confirm1==true)
		{
			//var date = Date.now();
	request
	.post('https://api-uat.tatacommunications.com:443/testBotService/tickets')
			.send(
			{
			"desc": session.dialogData.cDescription,
			"severity": session.dialogData.cSeverity.entity  ,
			"date": "2015-10-18 13:43:02",
			"contact": {
			"name": " PWC TEST",
			"mobile": "9004352040",
			"email": "p@noreply.com"
			},
			
			"ticketCategory": {
			"ticketType": "TrafficIP",
			"originIP": session.dialogData.cOriginIP,
			"destIP": session.dialogData.cDestinationIP,
			"problemType": "INTERNET-PACKET LOSS"
			}
			}
			)
			.set('Accept', 'application/json')
			.set('Content-Type', 'application/json')
			.end(function(err, res){
			if (err || !res.ok) {
			session.send('Oh no! error. Please try again!');
			session.endDialog();
			} else {
			var response = res.body;
			var name = response.ticketID;
			
					session.send("Your request has been successfully recorded and the ticketId is:  "+name+"  "+"<br/>Thank you for using the service");
					session.endDialog();
					}
                  });
		}
		
		else{session.send("session will be terminated");
		session.endDialog();}

	}
	
]);

 
