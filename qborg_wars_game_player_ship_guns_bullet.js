/*Класс описывает пулю "плазматической пушки".
 * Выстрел представляет собой THREE.Mesh().
 * Имеет направление, скорость, дистанцию.
 * IN:
 * json_params = {
 * 	
 * }
 */

var _PlasmaBullet = function (json_params)
{	
	this.Distance = json_params.distance;
	this.Speed = json_params.speed;
	this.Direction = new THREE.Vector3().copy(json_params.direction);
	this.Mesh = json_params.mesh;
	this.Mesh.position.copy(json_params.start_position);
	this.AllPlayers = json_params.all_players;
	this.Damage = json_params.damage;
	
	this.CollidableMeshes = [];
	
	this.pushPlayersMeshesToCollidableMeshes();
	
	this.Status = "live";		
	
	if(json_params.scene !== undefined)
		json_params.scene.add(this.Mesh);
};

_PlasmaBullet.prototype.addToScene = function (scene)
{
	scene.add(this.Mesh);
}

_PlasmaBullet.prototype.removeFromScene = function (scene)
{
	scene.remove(this.Mesh);
}

_PlasmaBullet.prototype.update = function ()
{
	this.collisionControl();
}

_PlasmaBullet.prototype.setStatus = function (status)
{
	 if(status !== undefined)
		this.Status = status;
	 else
	  throw new Error("have no status");
}

_PlasmaBullet.prototype.getStatus = function ()
{
		return this.Status;
}
/*Отслеживает попадание в противников
 *В работе учитываем всех мешей: RemotePlayers.length + LocalPlayer
 */
_PlasmaBullet.prototype.collisionControl = function ()
{
	if(this.CollidableMeshes.length != (this.AllPlayers[1].length+1))
	{
		this.CollidableMeshes.splice(0, this.CollidableMeshes.length);
		this.pushPlayersMeshesToCollidableMeshes();
	}
	
	var originPoint = this.Mesh.position.clone();
	
	for (var vertexIndex = 0; vertexIndex < this.Mesh.geometry.vertices.length; vertexIndex++)
	{		
		var localVertex = this.Mesh.geometry.vertices[vertexIndex].clone();
		var globalVertex = localVertex.applyMatrix4( this.Mesh.matrix );
		var directionVector = globalVertex.sub( this.Mesh.position);
		
		var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
		var collisionResults = ray.intersectObjects( this.CollidableMeshes );
		// если произвошло столкновение
		if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) 
		{
			for(var i=0; i<this.CollidableMeshes.length; i++)
			{
				if(collisionResults[0].object === this.CollidableMeshes[i])
				{
					player = this.getPlayerByMesh(this.CollidableMeshes[i]);
					player.getShip().onDamaged({damage: this.Damage});
					this.setStatus("dead");
					return;
				}
			}
		}
	}	
	
};

/*Возвращает игрока по переданном Mesh'у
 */
_PlasmaBullet.prototype.getPlayerByMesh = function (mesh)
{
	if(mesh === this.AllPlayers[0].getMesh())
	{
		return this.AllPlayers[0];
	}
	for(var i=0;i<this.AllPlayers[1].length; i++)
	{
		if(mesh === this.AllPlayers[1][i].getMesh())
			return this.AllPlayers[1][i];
	}
	
	throw new Error(" can't find player by mesh");
}

_PlasmaBullet.prototype.pushPlayersMeshesToCollidableMeshes = function ()
{	
	this.CollidableMeshes.push(this.AllPlayers[0].getMesh());
	
	for(var i=0;i<this.AllPlayers[1].length;i++)
	{
		this.CollidableMeshes.push(this.AllPlayers[1][i].getMesh());
	}
}
