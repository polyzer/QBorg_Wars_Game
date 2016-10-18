var _PlasmaBullet = function (json_params)
{
	this.Distance = json_params.distance;
	this.Speed = json_params.speed;
	this.Direction = new THREE.Vector3().copy(json_params.direction);
	this.Mesh = json_params.mesh;
	this.Mesh.position.copy(json_params.start_position);
};
