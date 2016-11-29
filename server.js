var express = require("express");
var app = express();
var ExpressPeerServer = require("peer").ExpressPeerServer;
var server = app.listen(9000);

var options = {
	debug: true
};


var ids = [];
var peerServer = ExpressPeerServer(server, options);
app.use("/myapp", peerServer);

app.post("/get_peers_ids", function(req, res) {	
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
  //res.contentType('json');
	res.send(JSON.stringify({response: ids}));
});

peerServer.on("connection", function(id) {
	//console.log(id + " connected");
	ids.push(id);
});

peerServer.on("disconnect", function(id) {
	//console.log(id + " disconnected");
	for(var i=0; i < ids.length; i++)
	{
		if(ids[i] === id)
			ids.splice(i,1);
	}
});
