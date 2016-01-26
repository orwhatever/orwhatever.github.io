var gl;
var modelViewMatrixLoc;
var projectionMatrixLoc;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0, 1, 0);

var ctm = [
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1
	];
	
var ctm2 = [
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1
	];
	
var ctm3 = [
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1
	];

	var indices = [
		1, 0, 3,
		3, 2, 1,
		2, 3, 7,
		7, 6, 2,
		3, 0, 4,
		4, 7, 3,
		6, 5, 1,
		1, 2, 6,
		4, 5, 6,
		6, 7, 4,
		5, 4, 0,
		0, 1, 5
	];

window.onload = function init() {
	var canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext("webgl");
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
	
	gl.enable(gl.DEPTH_TEST);
	
	var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];
	
	var vertexColors = [
		[ 0.0, 0.0, 0.0, 1.0 ], // black
		[ 1.0, 0.0, 0.0, 1.0 ], // red
		[ 1.0, 1.0, 0.0, 1.0 ], // yellow
		[ 0.0, 1.0, 0.0, 1.0 ], // green
		[ 0.0, 0.0, 1.0, 1.0 ], // blue
		[ 1.0, 0.0, 1.0, 1.0 ], // magenta
		[ 1.0, 1.0, 1.0, 1.0 ], // white
		[ 0.0, 1.0, 1.0, 1.0 ] // cyan
	];
	
	// Load shaders and initialize attribute buffers
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	
	modelViewMatrixLoc = gl.getUniformLocation(program, "ctm");
	projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
	
	// Write to GPU with indices
	var iBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices),	gl.STATIC_DRAW);
	
	// Write to GPU with pos
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	
	//Write to GPU with color
	var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);
	
	var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
	
	render();
}

//frustum(left, right, bottom, top, near, far) 


function render() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//ctm = translate(0, 0, 0);
	//ctm = mult(ctm, rotateX(35.26));
	//ctm = mult(ctm, rotateY(45));
	
	//EyePos
	ctm = mult(lookAt(vec3(5, 5, 5), at, up), translate(2,2,0));

	ctm2 = mult(lookAt(vec3(6, -1.5, 6), at, up), translate(-2,-2,0));

	ctm3 = lookAt(vec3(0, 0, 7), at, up);
	
	projectionMatrix = perspective(45.0, 1, 0.05, 200);
	
	gl.uniformMatrix4fv(projectionMatrixLoc, false,	flatten(projectionMatrix));
	
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm));
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm2));
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(ctm3));
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
	
	requestAnimFrame(render);
}