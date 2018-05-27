
//import express.js 
var express = require('express');
//assign it to variable app 
var app = express();
//create a server and pass in app as a request handler
var serv = require('http').Server(app); //Server-11

//send a index.html file when a get request is fired to the given 
//route, which is ‘/’ in this case
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/index.html');
});


app.use('/',express.static(__dirname));

//listen on port 2000
serv.listen(process.env.PORT || 2000);
console.log("Server started.");
			