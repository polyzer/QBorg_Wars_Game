/* Объект содержит сообщения, которые должны пересылаться между игроками
 * json_params.nickname является обязательным для передачи параметром!
 */
var _QBorgGameNetMessages = function (json_params)
{
	
			this.MoveMessage = {};
			this.MoveMessage.request = "move";
			this.MoveMessage.data = 
			{
				position: {x:0, y:0, z:0}, // Mesh.position.clone();
				rotation: {x:0, y:0, z:0}, // Mesh.rotation.clone();
			};

			this.ShootMessage = {};
			this.ShootMessage.request = "shoot";
			this.ShootMessage.data = 
			{
				distance: 5000,
				speed: 6000,
				direction: {x:100,y:100,z:100},
				start_position: {x:0,y:0,z:0},
				gun_type: "plasma_gun",
				bullet_type: "cube_green_bullet",
				damage: 500 				
			};
			/*Это сообщение должно отправляться для того, чтобы получить nickname'ы
			 * уже существующих игроков!
			 */ 
			this.GetNickNameMessage = {};
			this.GetNickNameMessage.request = "get_nickname";
			this.GetNickNameMessage.data = {
				requested_player_nickname: json_params.nickname
			};
			/*Это сообщение должно отправляться только в ответ на запрос "get_nickname";
			 */ 
			this.SendNickNameMessage = {};
			this.SendNickNameMessage.request = "send_nickname";
			this.SendNickNameMessage.data = 
			{
				nickname: json_params.nickname
			};

};

_QBorgGameNetMessages.prototype.setNickname = function (json_params)
{
	this.GetNickNameMessage.data.requested_player_nickname = json_params.nickname;
	this.SendNickNameMessage.data.nickname = json_params.nickname;
}

/* Устанавливает новые о позиции корабля в пространстве, которые затем будут отправлены остальным пользователям;
 */

_QBorgGameNetMessages.prototype.setPositionDataFromMesh = function (mesh_object)
{
	this.MoveMessage.data.position = mesh_object.position.clone();
	this.MoveMessage.data.rotation = mesh_object.rotation.clone();
}

