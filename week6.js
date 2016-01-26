var gl;
var modelViewMatrixLoc;
var projectionMatrixLoc;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0, 1, 0);

//var numVertices  = 36;

var va = vec3(-4.0, -1.0, -1.0);
var vb = vec3(4.0, -1.0, -1.0);
var vc = vec3(4.0, -1.0, -21.0);
var vd = vec3(-4.0, -1.0, -21.0);

var vertices = []; //va,vb,vd,vc,vd,vb

var modelViewMatrix = [
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1
	];

var texSize = 64;
var numRows = 8;
var numCols = 8;

var myTexels = new Uint8Array(4*texSize*texSize);

for (var i = 0; i < texSize; ++i) {
	for (var j = 0; j < texSize; ++j) {
		var patchx = Math.floor(i/(texSize/numRows));
		var patchy = Math.floor(j/(texSize/numCols));
		var c = (patchx%2 !== patchy%2 ? 255 : 0);
		myTexels[4*i*texSize+4*j] = c;
		myTexels[4*i*texSize+4*j+1] = c;
		myTexels[4*i*texSize+4*j+2] = c;
		myTexels[4*i*texSize+4*j+3] = 255;
	}
}

var texCoordsArray = [ ];
var texCoord = [
	vec2(-1.5, 0.0),
	vec2(2.5, 0.0),
	vec2(2.5, 10.0),
	vec2(-1.5, 10.0)
	/*vec2(0.0, 0.0), 
	vec2(1.0, 0.0),
	vec2(0.0, 1.0),
	vec2(1.0, 1.0)*/
];

function quad(a,b,c,d) {

	vertices.push(a);
    texCoordsArray.push(texCoord[0]); 
	
	vertices.push(b);
    texCoordsArray.push(texCoord[1]);
	 
	vertices.push(d);
    texCoordsArray.push(texCoord[3]);
	 
	vertices.push(c);
    texCoordsArray.push(texCoord[2]); 
	
	vertices.push(d);
    texCoordsArray.push(texCoord[3]);
	 
	vertices.push(b);
    texCoordsArray.push(texCoord[1]);
	 
}


function configureTexture(image) {
    var texture = gl.createTexture();
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap( gl.TEXTURE_2D );
    //gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,gl.NEAREST_MIPMAP_LINEAR );
    //gl.TEXTURE_WRAP_S
	

	
	
	
}




window.onload = function init() {
	var canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext("webgl");
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
	
	
	
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	//gl.cullFace(gl.FRONT);
	
	// Load shaders and initialize attribute buffers
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	
	quad(va,vb,vc,vd);
	
	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
	projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
	
	/*
	//Create Texture Object
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	//gl.texImage2D(target, level, iformat,width, height, border, format, type, texelArray)
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, myTexels); //TODO
	gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0); 
	*/
	
	
	// Write to GPU with vertices

		
	var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
	
	var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);
	
	configureTexture(myTexels);
	
	document.getElementById("Nearest").onclick = function(){
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	};
	
    document.getElementById("Linear").onclick = function(){
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	};
    document.getElementById("Mipmap").onclick = function(){
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
	};
	
	document.getElementById("Repeat").onclick = function(){
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	};
    document.getElementById("Clamping").onclick = function(){
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S , gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T , gl.CLAMP_TO_EDGE);
	};
	

	render();
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//EyePos
	modelViewMatrix = mult(lookAt(vec3(0, 1, 3), at, up), translate(0, 0, 0));
	projectionMatrix = perspective(90.0, 1.0, 0.05, 200);
	
	gl.uniformMatrix4fv(projectionMatrixLoc, false,	flatten(projectionMatrix));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	
	//gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
	
	//Redraw
	requestAnimFrame(render);
	
}