<!DOCTYPE html>
<html> 
<head>
<meta charset="UTF-8" /> 
<script src='../games_resources/libs/three.js/build/three.js'></script>
<script src='../games_resources/libs/three.js/examples/js/controls/FirstPersonControls.js'></script>
<script src='../games_resources/libs/three.js/examples/js/controls/PointerLockControls.js'></script>
<script src='../games_resources/libs/three.js/examples/js/controls/FlyControls.js'></script>
<script src='../games_resources/libs/three.js/src/extras/THREEx/THREEx.FullScreen.js'></script>
<script src='../games_resources/libs/three.js/src/extras/THREEx/THREEx.KeyboardState.js'></script>
<script src='../games_resources/libs/three.js/src/extras/THREEx/THREEx.WindowResize.js'></script>
<script src='../games_resources/libs/three.js/examples/js/renderers/CSS3DRenderer.js'></script>
			 
<script src="../games_resources/libs/jquery.js"></script>
<script src="../games_resources/libs/peer.min.js"></script>
<script src="../games_resources/libs/katex/katex.min.js"></script>
<link href="../games_resources/libs/katex/katex.min.css" rel="stylesheet" type="text/css">

<script src='./qborg_wars_game_menu.js'></script>
<script src='./qborg_wars_game_net_message.js'></script>
<script src='./qborg_wars_game_player.js'></script>
<script src='./qborg_wars_game_player_ship.js'></script>
<script src='./qborg_wars_game_player_ship_guns.js'></script>
<script src='./qborg_wars_game_player_ship_guns_bullet.js'></script>
</head>

<body>

<script>
// Game class
var _QBorgGame = function () 
{
	// подготовка
	this.Container = document.createElement("div");
	this.Container.setAttribute("id", "GameContainer");
	document.body.appendChild(this.Container);

	this.Scene = new THREE.Scene();
	this.GameWidth = 1000;
	this.GameHeight = 800;

	this.Camera = new THREE.PerspectiveCamera(45, this.GameWidth/this.GameHeight, 10, 10000);
	this.Renderer = new THREE.WebGLRenderer();
	this.Renderer.setSize(this.GameWidth, this.GameHeight);
	
	this.Container.appendChild(this.Renderer.domElement);


//	this.Keyboard = new THREEx.KeyboardState();
	
	this.Clock = new THREE.Clock();
	

// массив кубов врагов, которые будут добавляться при заходе нового игрока
	this.Nickname = this.generateRandomString(8);
	this.ID = this.generateRandomString(8);
	
// ВНИМАНИЕ: В игре используется глобальный объект		
	this.NetMessagesObject = new _QBorgGameNetMessages({nickname: this.Nickname, id: this.ID});

	
	// Список удаленных игроков;
	this.RemotePlayers = [];
 
  // Локальный игрок
	this.LocalPlayer = null;
	//Все игроки в системе.
	//[0] -  LocalPlayer;
	//[1]...RemotePlayers.length - удаленные игроки
  // структура, хранящая все игроков, включая локального;	
	this.AllPlayers = [];
	
	this.Peer = new Peer({host: 'localhost', 
												port: 9000, 
												path: '/myapp',
												debug: true
											});
	
  this.onOpenInitAndStartGameBF = this.onOpenInitAndStartGame.bind(this);
	this.Peer.on("open", this.onOpenInitAndStartGameBF);

};		
/*
		Генерирует рандомную строку
 */
_QBorgGame.prototype.generateRandomString = function(len)
{
	var text = [];
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	if((len !== undefined) && (len > 0)){
		for(var i=0; i<len; i++)
			text.push(possible.charAt(Math.floor(Math.random() * possible.length)));
	}
	text = text.join("");
	return text;
}

/* Инициализирует начало работы Peer.js
 */
_QBorgGame.prototype.onOpenInitAndStartGame = function (e)
{
  	// Устанавливаем обработчика событий
	this.createPlayerByRecievedConnectionBF = this.createPlayerByRecievedConnection.bind(this);
	this.Peer.on('connection', this.createPlayerByRecievedConnectionBF);
  
	this.getAndSetInitConnections();
//	this.updateGameProcess();
	// Локальный игрок, который будет
	this.LocalPlayer = new _QBorgGameLocalPlayer({
		scene: this.Scene, 
		remote_players: this.RemotePlayers,
		all_players: this.AllPlayers, 
		nickname: this.Nickname, 
		net_messages_object: this.NetMessagesObject,
		camera: this.Camera,
		game_width: this.GameWidth,
		game_height: this.GameHeight,
		id: this.ID
	});
		// начинаем игру, после инициализации
	this.AllPlayers.push(this.LocalPlayer);
	this.AllPlayers.push(this.RemotePlayers);

	this.startGame();

}

/*
 * Важнейшая функция.
 * Создает соединения с пользователями, которые уже
 * находятся в сети.
 */
 
_QBorgGame.prototype.createPlayersByExistingConnections = function (json_params)
{
	if(json_params === "undefined")
	{
		throw new Error(this.constructor.name + ".createPlayersByExistingConnections(json_response) - have no json_response");
		return;
	}
	
	if(typeof(json_params) === "string")
	{
		json_params = JSON.parse(json_params);
	}
	for(var i=0; i<json_params.response.length; i++)
	{
		// на сервере уже будет установлено наше соединение;
		// а сами к себе мы подсоединяться не должны!
		if(this.Peer.id === json_params.response[i])
		{
			continue;
		}
		conn = this.Peer.connect(json_params.response[i]);
		this.RemotePlayers.push(new _QBorgGameRemotePlayer({
				net_messages_object: this.NetMessagesObject,
				all_players: this.AllPlayers,
				scene: this.Scene,
				connection: conn
			}));
	}

}

/* Важнейшая функция игры, в которой происходит управление и обновление всех систем!!
 */

_QBorgGame.prototype.updateGameProcess = function ()
{
		this.Renderer.render(this.Scene, this.Camera);
		this.LocalPlayer.update();
		this.updateRemotePlayers();

	  requestAnimationFrame(this.updateGameProcessBF);
}

_QBorgGame.prototype.updateRemotePlayers = function ()
{
		for(var j=0; j<this.RemotePlayers.length; j++)
	  {
			this.RemotePlayers[j].update();
		}
}

// функция делает ajax запрос на signal server
_QBorgGame.prototype.getAndSetInitConnections = function ()
{
	// создаем обертку с привязанным контекстом,
	// которую затем можно использовать в success параметре
	createPlayersByExistingConnectionsBindFunc = this.createPlayersByExistingConnections.bind(this);
	$.ajax({
		type:"POST",
		url:"http://localhost:9000/get_peers_ids",
		async: false,
		success: createPlayersByExistingConnectionsBindFunc
	});
}

/* функция добавляет полученное соединение в массив соединений Connctions
 * и сразу отправляет запрос на получение nickname нового игрока
 */
_QBorgGame.prototype.createPlayerByRecievedConnection = function (conn)
{
	this.RemotePlayers.push(new _QBorgGameRemotePlayer({
															connection: conn,
															scene: this.Scene,
															all_players: this.AllPlayers,
															net_messages_object: this.NetMessagesObject													
												}));
};


/* завершаем соединение с игроком
 */
_QBorgGame.prototype.disconnectRemotePlayers = function()
{
	while(this.RemotePlayers.length > 0)
	{
		this.RemotePlayers[this.RemotePlayers.length-1].Conection.close();
		this.RemotePlayers.pop();
	}
};
/*Устанавливает Nickname во всех необходимых структурах
*/
_QBorgGame.prototype.setNickname = function (nickname)
{
	this.Nickname = nickname;
	this.NetMessagesObject.setNickname(nickname);
}

_QBorgGame.prototype.startGame = function ()
{
		this.updateGameProcessBF = this.updateGameProcess.bind(this);
		requestAnimationFrame(this.updateGameProcessBF);	
}

// создаем игру при загрузке приложения			
//var GameObj = new _QBorgGame();
var MenuObj = new _GameMenu();

</script>
</body>
</html>
