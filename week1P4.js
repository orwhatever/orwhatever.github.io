var gl;
var points;
var colors;
var theta = 0.0;
var thetaLoc ;

window.onload = function init() {
	var canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext("webgl");
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
	theta = 0.0;
	
	gl.enable(gl.DEPTH_TEST);
	
	points = [
		vec2(0, 0.5),
		vec2(-0.5, 0),
		vec2(0.5, 0),
		vec2(0, -0.5),
		vec2(-0.5, 0),
		vec2(0.5, 0),
		

		
	];
	
	colors = [
		vec3(1.0, 0.0, 0.0),
		vec3(0.0, 1.0, 0.0),
		vec3(0.0, 0.0, 1.0),
		vec3(1.0, 0.0, 0.0),
		vec3(0.0, 1.0, 0.0),
		vec3(0.0, 0.0, 1.0)
	];

	var colorsArray = [ ];
	for (var index = 0; index < points.length; ++index) {
		//determine which color[i] to assign to pointsArray[index]
		colorsArray.push(colors[index]);
	}
	
	// Load shaders and initialize attribute buffers
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	
	thetaLoc = gl.getUniformLocation(program, "theta");
	gl.uniform1f(thetaLoc, theta); //the 1f indicates that we are sending the value of a floating-point variable
	
	// Write to GPU with pos
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	
	//Write to GPU with color
	var cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
	
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
	
	
	//DisplayUpdate using timer
	//setInterval(render, 50);
	render();
}

function render() {
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	theta += 0.01;
	gl.uniform1f(thetaLoc, theta);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, points.length);
	
	requestAnimFrame(render); //DisplayUpdate using requestAnimFrame
}