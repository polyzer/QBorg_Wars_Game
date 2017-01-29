/* Изначально предполагается 2 режима работы всей игры:
 * 1= Режим, в котором все игроки располагаются в одной комнате и играют в одном пространстве;
 * 2= Режим с комнатами, в которых 
 */
var express = require("express");
var ExpressPeerServer = require("peer").ExpressPeerServer;

var express = require("./qborg_wars_game_constants.js");
var app = express();
var server = app.listen(9000);


var options = {
	debug: true
};
/*
 * Класс описывает комнату, в которой будут находиться до max значения человек
 *
 * PlayersIDSArray - содержит список ID's всех игроков;
 * LevelType - описывает тип комнаты;
 * RoomID - идентификатор комнаты;
 * MaxPlayersCount - максимальное число игроков для данной комнаты;
 */
var _Room = function (json_params)
{
	this.PlayersIDSArray = [];
	this.RoomType = 0;
	this.MaxPlayersCount = 20;
	this.RoomID = "room_id";
};

/* Теперь ids содержит список неопределившихся пользователей,
 * Который никуда не должен передаваться.
 */
var UndecidedIDs = [];
/*Массив содержит массив комнат;
 */
var Rooms = [];

function SingleRoom_OnDisconnect(id)
{
	for(var i=0; i<UndecidedIDs.length;  i++)
	{
		if(UndecidedIDs[i] === id)
		{
			UndecidedIDs.splice(i, 1);
		}
	}
	
	for(var i=0; i<Rooms[0].length; i++)
	{
		if(Rooms[0][i] === id)
		{
			Rooms[0].splice(i, 1);
		}
	}
}

function SingleRoom_OnConnect(id)
{
	UndecidedIDs.push(id);
}

function MultiRoom_OnDisconnect(id)
{
	for(var i=0; i<Undeci1dedIDs.length;  i++)
	{
		if(UndecidedIDs[i] === id)
		{
			UndecidedIDs.splice(i, 1);
			return
		}
	}
	
	for(var i=0; i<Rooms.length; i++)
	{
		for(var j=0; j<Rooms[i].length; j++)
		{
			/*Если нашли совпадение id'шников*/
			if(Rooms[i][j] === id)
			{
				Rooms[i].splice(j, 1);
				return;
			}
			
		}
	}
}

function MultiRoom_OnConnect(id)
{
	UndecidedIDs.push(id);
}

function MultiRoom_onGetRoomsList(req, res)
{
}

function MultiRoom_onComeIntoRoom(req, res)
{
}

function MultiRoom_onLeaveRoom(req, res)
{
}

function MultiRoom_onCreateRoom(req, res)
{
}

var peerServer = ExpressPeerServer(server, options);
app.use("/myapp", peerServer);

/*Запрос на получение списка всех комнат*/
app.post("/get_rooms_list", function(req, res) {	
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
  //res.contentType('json');
	res.send(JSON.stringify({response: ids}));
});
/*Запрос на вход в комнату
 *Должен вернуть список idшников игроков, которые в ней находятся. */
app.post("/come_into_room", function(req, res) {	
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  

	res.send(JSON.stringify({response: ids}));
});
/*Если пользователь решил выйти из в основное меню*/
app.post("/leave_room", function(req, res) {	
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  

	res.send(JSON.stringify({response: ids}));
});

/*Запрос на создание новой комнаты*/
app.post("/create_room", function(req, res) {	
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
  //res.contentType('json');
	res.send(JSON.stringify({response: ids}));
});

app.post("/get_peers_ids", function(req, res) {	
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
  //res.contentType('json');
	res.send(JSON.stringify({response: ids}));
});


/*При создании соединения, игрок автоматически добавляеся в список
 *неопределившихся игроков;
 **/
peerServer.on("connection", function(id) {
	//console.log(id + " connected");
	UndecidedIDs.push(id);
});
/*При ризрыве соединения, выходит, что пользователь полностью покинул игру;
 *Должен быть автоматически удален из всех структур, в которых он содержится;
 **/
peerServer.on("disconnect", function(id) {
	//console.log(id + " disconnected");
	for(var i=0; i < ids.length; i++)
	{
		if(UndecidedIDs[i] === id)
			UndecidedIDs.splice(i,1);
	}
});
