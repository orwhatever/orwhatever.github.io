var gl;
var modelViewMatrixLoc;
var projectionMatrixLoc;
var lightPositionLoc;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0, 1, 0);

//var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
//var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var lightPosition = vec4(0.0, 0.0, -1.0, 0.0);

var va = vec4(0.0, 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333, 1);
var numTimesToSubdivide = 4;
var pointsArray = [];
var normalsArray = [];
var index = 0;

var modelViewMatrix = [
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1
	];

window.onload = function init() {
	var canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext("webgl");
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
	
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.FRONT);
	
	tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
	
	// Load shaders and initialize attribute buffers
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	
	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
	projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
	lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
	lightDiffuseLoc = gl.getUniformLocation(program, "lightDiffuse");
	//lightAmbientLoc = gl.getUniformLocation(program, "lightAmbient");
	
	
	// Write to GPU with normalsArray
	var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
	
	// Write to GPU with pointArray
	var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
	
	var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
	// Write to GPU with lightPos
	
	
	document.getElementById("Increase").onclick = function() {
		numTimesToSubdivide++;
		index = 0;
		pointsArray = [];
		normalsArray = [];
		init();
	}
	
	document.getElementById("Decrease").onclick = function() {
		if(numTimesToSubdivide) {numTimesToSubdivide--;}
		index = 0;
		pointsArray = [];
		normalsArray = [];
		init();
	}
	
	render();
}

//frustum(left, right, bottom, top, near, far) 

function tetrahedron(a, b, c, d, n) {
	divideTriangle(a, b, c, n);
	divideTriangle(d, c, b, n);
	divideTriangle(a, d, b, n);
	divideTriangle(a, c, d, n);
}

function divideTriangle(a, b, c, count) {
	if (count > 0) {
		var ab = normalize(mix(a, b, 0.5), true);
		var ac = normalize(mix(a, c, 0.5), true);
		var bc = normalize(mix(b, c, 0.5), true);
		divideTriangle(a, ab, ac, count - 1);
		divideTriangle(ab, b, bc, count - 1);
		divideTriangle(bc, c, ac, count - 1);
		divideTriangle(ab, bc, ac, count - 1);
	} else {
		triangle(a, b, c);
	}
}

function triangle(a, b, c) {
	pointsArray.push(a);
	pointsArray.push(b);
	pointsArray.push(c);
	
	normalsArray.push(a);
    normalsArray.push(b);
    normalsArray.push(c);
	
	index += 3;
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//EyePos
	modelViewMatrix = mult(lookAt(vec3(2, 1, 2), at, up), translate(0, 0, 0));
	projectionMatrix = perspective(45.0, 1.0, 0.05, 200);
	
	gl.uniformMatrix4fv(projectionMatrixLoc, false,	flatten(projectionMatrix));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
	gl.uniform4fv(lightDiffuseLoc, flatten(lightDiffuse));
	
	for(var i=0; i<index; i+=3) {
       gl.drawArrays(gl.TRIANGLES, i, 3);
	}
	
	//Redraw
	//requestAnimFrame(render);
	
}