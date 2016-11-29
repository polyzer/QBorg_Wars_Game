/*Rласс описывает 3D меню.
 *В нем будет находиться текущий корабль игрока и бэкграунд.
 */
var _GameMenu = function (json_params)
{
	this.Container = document.createElement("div");
	this.Container.setAttribute("id", "MenuContainer");
	document.body.appendChild(this.Container);
	
	this.Camera = new THREE.PerspectiveCamera(45, 800/800, 10, 10000);	
	this.Camera.position.set(0,0,1000);

	this.Material = new THREE.MeshBasicMaterial();
	
	this.CSSScene = new THREE.Scene();
	this.Scene = new THREE.Scene();
	
	this.Renderer = new THREE.WebGLRenderer();
	this.Renderer.setSize(800, 800);
	this.Container.appendChild(this.Renderer.domElement);
	
	
	this.CSSRenderer = new THREE.CSS3DRenderer();
	this.CSSRenderer.setSize(800, 800);
	this.CSSRenderer.domElement.style.position = "absolute";
	this.CSSRenderer.domElement.style.top = 0;
	this.Container.appendChild(this.CSSRenderer.domElement);

	
	this.Inputs = {};
	
	this.Inputs.Nickname = document.createElement("input");
	this.Inputs.Nickname.type = "text";
	this.Inputs.Nickname.id = "name";
	this.Inputs.Nickname.setAttribute("autofocus", "");

/*
	this.NicknameInput = document.createElement("div");
	
	this.element.style.width = "auto";
	this.element.style.height = "auto";
	this.element.style.color = "red";
	this.element.style.backgroundColor = "blue";
	this.element.style.border = "solid 3px green";
	katex.render("c = \\pm\\sqrt{a^2 + b^2}", this.element);
*/	
	this.cssobject = new THREE.CSS3DObject(this.Inputs.Nickname);
/*	this.cssobject.position.x = Math.random() * 200 - 100;
	this.cssobject.position.y = Math.random() * 200 - 100;
	this.cssobject.position.z = Math.random() * 200 - 100;
	this.cssobject.rotation.x = Math.random();
	this.cssobject.rotation.y = Math.random();
	this.cssobject.rotation.z = Math.random();
*/	
	this.cssobject.position.x = Math.random();
	this.cssobject.position.y = Math.random();
	this.cssobject.position.z = Math.random();
	
	this.CSSScene.add(this.cssobject);

	/*
	this.Plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), this.Material);
	this.Plane.position.copy( this.cssobject.position );
	this.Plane.rotation.copy( this.cssobject.rotation );
	this.Plane.scale.copy( this.cssobject.scale );
	this.Scene.add( this.Plane );
	*/
	
	this.updateBF = this.update.bind(this);
	this.updateBF();
};

_GameMenu.prototype.update = function ()
{
	this.Renderer.render(this.Scene, this.Camera);
	this.CSSRenderer.render(this.CSSScene, this.Camera);
	
	this.cssobject.rotation.x += 0.01;
	this.cssobject.rotation.y += 0.01;
	requestAnimationFrame(this.updateBF);
};


