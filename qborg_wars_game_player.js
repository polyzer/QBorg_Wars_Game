/* Класс описывает локального игрока.
 * Класс должен ОБЯЗАТЕЛЬНО принять необходимые параметры в формате JSON:
 * {
 *   player_type: type - тип игрока, фиксирован....
 *   all_players: Game.Players, - содержит список удаленных игроков, чтобы отсылать им данные
 *   scene: THREE.Scene(); - объект сцены, в которую нужно будет добавить свой корабль
 * }
 */
var _QBorgGameLocalPlayer = function (json_params)
{
	if(json_params !== undefined)
	{
		this.Scene = json_params.scene;
		this.PlayerType = "local";
	  this.RemotePlayers = json_params.remote_players;
	  this.Nickname = json_params.nickname;
	  this.NetMessagesObject = json_params.net_messages_object;
    this.Camera = json_params.camera;
	  this.Ship = new _QBorgGamePlayerShip({scene: json_params.scene, camera: this.Camera});
	  
	  this.Controls = new THREE.FlyControls(this.Ship.getMesh());
	  this.Controls.movementSpeed = 70;
    this.Controls.rollSpeed = Math.PI / 18;
		this.Controls.autoForward = false;
		this.Controls.dragToLook = false;
		
		this.Raycaster = new THREE.Raycaster();
		this.MouseVector = new THREE.Vector2();
		this.INTERSECTED = null;


  }else
		console.log(this.constructor.name + " have no json_params!");

		this.onMouseMoveBF = this.onMouseMove.bind(this);
		window.addEventListener('mousemove', this.onMouseMoveBF, false);

		this.onClickBF = this.onClick.bind(this);
		window.addEventListener('click', this.onClickBF, false);
		
};

_QBorgGameLocalPlayer.prototype.onMouseMove = function (event)
{
	this.MouseVector.x = (event.clientX / GameObj.GameWidth) * 2 - 1;
	this.MouseVector.y = -(event.clientY / GameObj.GameHeight) * 2 + 1;
};

_QBorgGameLocalPlayer.prototype.onClick = function (event)
{
//	console.log(this.Raycaster.ray.direction);
	// собираем параметры, необходимые для выстрела в единую структуру
	data = this.setDataParameters({
		direction: this.Raycaster.ray.direction.clone(),
		gun_type: "plasma_gun",
		bullet_type: "cube_green_bullet"	
	});
	// сначала отправляем данные!
	console.log(data);
	this.NetMessagesObject.ShootMessage.data = data;
	this.sendDataToAllRemotePlayers(this.NetMessagesObject.ShootMessage);
	// теперь стреляем сами!
	this.Ship.shoot(data);
};

/*Функция устанавливает параметры для запроса для произведения выстрела 
 * и отправки запроса другим игрокам
 * IN:
 * json_params{
 *  gun_type: type
 * }
 *
 * OUT:
 * ret_params{
 *  distance: json_params.parameters.distance,
 * 	speed: json_params.parameters.speed,
 * 	direction: json_params.direction,
 * 	start_position: json_params.parameters.start_position,
 *	gun_type: "gun_type"			
 * }
 * 
 */

_QBorgGameLocalPlayer.prototype.setDataParameters = function (json_params)
{
	ret_params = this.Ship.getBulletParametersByGunAndBulletTypes(json_params);
	ret_params.direction = json_params.direction;
	return ret_params;
};

/*Вызывается,когда мы должны переслать всем  
 *перемещения/стрельбы и присылает данные об этом
 * MoveMessage | ShootMessage (класс _QBorgGameNetMessages);
 * Локальный игрок не должен принимать данные, он их только отсылает
 * остальным участникам игры;
 */
_QBorgGameLocalPlayer.prototype.sendDataToAllRemotePlayers = function (message)
{
	if(typeof(message) !== "string")
	{
		message = JSON.stringify(message);
	}
	for(i=0;i< this.RemotePlayers.length; i++)
	{
		if(this.RemotePlayers[i].ConnectionStatus === "open")
			this.RemotePlayers[i].Connection.send(message);
		
	}
};

/* Устанавливает массив удаленных игроков, которым мы будем отсылать сообщения;
 */

_QBorgGameLocalPlayer.prototype.setRemotePlayers = function (json_params)
{
	if(json_params === undefined)
	{
		throw new Error("json_params is undefined in: " + this.constructor.name + "");
  } else
		this.RemotePlayers = json_params.remote_players;
};

/*Обновляет данные в объекте сообщений, которые будут отправляться другим
 *пользователям при перемещении
 * 
 */
_QBorgGameLocalPlayer.prototype.updateMessages = function ()
{
	this.NetMessagesObject.setPositionDataFromMesh(this.Ship.getMesh());
};

_QBorgGameLocalPlayer.prototype.raycastingControl = function ()
{
	
	this.Raycaster.setFromCamera(this.MouseVector, this.Camera);

	intersects = this.Raycaster.intersectObjects(this.Scene.children);
	if (intersects.length > 0)
	{
		if(this.INTERSECTED != intersects[0].object)
		{
			if(this.INTERSECTED)
				this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
			this.INTERSECTED = intersects[0].object;
			this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
			this.INTERSECTED.material.emissive.setHex(0xff0000);
		}			
	}else
	{
		if (this.INTERSECTED)
			this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
		this.INTERSECTED = null;
	}
	
}

/* Обновляет все необходимые объекты и проводит вычисления
 */
_QBorgGameLocalPlayer.prototype.update = function ()
{
	this.raycastingControl();
	this.Ship.Life();
	
	this.Controls.update(0.1);
	this.updateMessages();
	this.sendDataToAllRemotePlayers(this.NetMessagesObject.MoveMessage);
	
};



/* Класс описывает игрока.
 * Класс должен ОБЯЗАТЕЛЬНО принять необходимые параметры в формате JSON:
 * {
 *   net_messages_object: nmo,		
 *   connection: connection, - соединение, из которого будут приходить данные, и в которое будут данные отправляться
 *   scene: THREE.Scene(); - объект сцены, в которую нужно будет добавить свой корабль,
 *   random: true | false
 * }
 * Класс удаленного игрока обрабатывает только входящие сообщения, но НИЧЕГО НЕ ОТСЫЛАЕТ!
 * 
 */

var _QBorgGameRemotePlayer = function (json_params)
{
	if(json_params !== undefined)
	{
		this.PlayerType = "remote";
		this.Scene = json_params.scene;		
		this.Connection = json_params.connection;
		this.NetMessagesObject = json_params.net_messages_object;
		this.Ship = new _QBorgGamePlayerShip({scene: this.Scene, random: true});
		this.ConnectionStatus = "null";
	}else
		console.log(this.constructor.name + " have no json_params!");
  
 this.onOpenConnectionBF = this.onOpenConnection.bind(this);
 this.Connection.on("open", this.onOpenConnectionBF);
 
 this.onDataRecievedFunc = this.onDataRecieved.bind(this); 
 this.Connection.on("data",  this.onDataRecievedFunc);

 this.onCloseConnectionFunc = this.disconnect.bind(this); 
 this.Connection.on("close", this.onCloseConnectionFunc);  

 this.onConnectionErrorFunc = this.onConnectionError.bind(this); 
 this.Connection.on("error", this.onConnectionErrorFunc);

};

/* при открытии соединения!
 */
_QBorgGameRemotePlayer.prototype.onOpenConnection = function()
{
		this.Connection.send(JSON.stringify(this.NetMessagesObject.GetNickNameMessage));

		this.ConnectionStatus = "open";
}

/* завершаем соединение с игроком
 */
_QBorgGameRemotePlayer.prototype.disconnect = function()
{
	this.Connection.close();
	this.ConnectionStatus = "closed";
	this.removeShipFromScene();
	console.log("connection was closed");
};

_QBorgGameRemotePlayer.prototype.onConnectionError = function(error)
{
	this.disconnect();
	this.ConnectionStatus = "closed";
	this.removeShipFromScene();
	console.log("Had " + error + " on: " +this.constructor.name + ".onConnectionError()");
};

_QBorgGameRemotePlayer.prototype.removeShipFromScene = function (json_params)
{
	this.Ship.removeMesh();
}
/*Вызывается, когда удаленный игрок совершает действия типа 
 *перемещения/стрельбы и присылает данные об этом
 * MoveMessage | ShootMessage (класс _QBorgGameNetMessages)
 */  
_QBorgGameRemotePlayer.prototype.onDataRecieved = function (json_params)
{
	// преобразуем полученные данные, если они не преобразованы в объект
	if(typeof(json_params) === "string")
	{
		json_params = JSON.parse(json_params);
	}
	// если игрок переместился
	if(json_params.request === "move")
	{
		this.Ship.setPosition(json_params.data.position);
		this.Ship.setRotation(json_params.data.rotation);
		//this.Ship.lookAt(data.look_at);
	} else 
	// если игрок выстрелил
		if(json_params.request === "shoot")
	{
		console.log(json_params.data);
		this.Ship.shoot(json_params.data);
	} else 
	// если игрок прислал свой Nickname
		if(json_params.request === "send_nickname")
	{
		this.Nickname = json_params.data.nickname;
	} else 
	// если данный удаленный игрок хочет получить NICKNAME ЛОКАЛЬНОГО ИГРОКА!!!!!!!!!!!!!!!!
		if(json_params.request === "get_nickname")
	{
		this.Nickname = json_params.data.requested_player_nickname;
		this.Connection.send(JSON.stringify(this.NetMessagesObject.SendNickNameMessage));
	}
};

_QBorgGameRemotePlayer.prototype.update = function ()
{
	this.Ship.Life();
};
