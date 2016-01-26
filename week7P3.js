var gl;
var modelViewMatrixLoc;
var projectionMatrixLoc;

const at = vec3(0.0, 1.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var light;
var m = mat4();
var theta = 0.0;
var black = vec4(0.0, 0.0, 0.0, 1.0);

// Plane
var planeColor = vec4(1.0, 1.0, 1.0,1.0);
var va = vec3(-2.0, -1.0, -1.0);
var vb = vec3(2.0, -1.0, -1.0);
var vc = vec3(2.0, -1.0, -5.0);
var vd = vec3(-2.0, -1.0, -5.0);

// Small1
var smallColor = vec4(1.0, 0.0, 0.0,1.0);
var va1 = vec3(0.25, -0.5, -1.25);
var vb1 = vec3(0.75, -0.5, -1.25);
var vc1 = vec3(0.75, -0.5, -1.75);
var vd1 = vec3(0.25, -0.5, -1.75);

// Small2
var va2 = vec3(-1.0, 0.0, -2.5);
var vb2 = vec3(-1.0, -1.0, -2.5);
var vc2 = vec3(-1.0, -1.0, -3.0);
var vd2 = vec3(-1.0, 0.0, -3.0);

var vertices = []; //va,vb,vd,vc,vd,vb

var modelViewMatrix, projectionMatrix;

var texSize = 64;
var texture;
var colorsArray = [];
var texCoordsArray = [];

var texCoord = [
	vec2(0.0, 0.0),
	vec2(1.0, 0.0),
	vec2(1.0, 1.0),
	vec2(0.0, 1.0)
];

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

function quad(a,b,c,d,color) {
	vertices.push(a);
	colorsArray.push(color);
    texCoordsArray.push(texCoord[0]);
	
	vertices.push(b);
	colorsArray.push(color);
    texCoordsArray.push(texCoord[1]);
	 
	vertices.push(d);
	colorsArray.push(color);
    texCoordsArray.push(texCoord[3]);
	 
	vertices.push(c);
	colorsArray.push(color);
    texCoordsArray.push(texCoord[2]); 
	
	vertices.push(d);
	colorsArray.push(color);
    texCoordsArray.push(texCoord[3]);
	 
	vertices.push(b);
	colorsArray.push(color);
    texCoordsArray.push(texCoord[1]);
}

window.onload = function init() {
	var canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext("webgl");
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	//gl.cullFace(gl.FRONT);
	
	light = vec3(0.0, 2.0, -2.0);
	m[3][3] = -1/light[1];
	m[3][1] = -1/light[1];
	
	// Load shaders and initialize attribute buffers
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	
	quad(va,vb,vc,vd,planeColor);
	quad(va1,vb1,vc1,vd1,smallColor);
	quad(va2,vb2,vc2,vd2,smallColor);
	quad(va1,vb1,vc1,vd1,black);
	quad(va2,vb2,vc2,vd2,black);
	
	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
	projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
	
	// Write to GPU with vertices
	var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
	// Write to GPU with colors
	var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
	
	// Write to GPU with texture
	var tBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
	var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
	gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vTexCoord);
	

	projectionMatrix = perspective(90.0, 1.0, 1, 100.0);
	gl.uniformMatrix4fv(projectionMatrixLoc, false,	flatten(projectionMatrix));
	
	// Load Image
	var image = new Image();
    image.onload = function() {
		configureTexture( image );
    }
    image.src = "xamp23.png";
	//gl.activeTexture( gl.TEXTURE0 );
    //gl.bindTexture( gl.TEXTURE_2D, texture );
	
	render();
}

function render() {
	
	theta += 0.05;
	if (theta > 2*Math.PI) {
		theta -= 2*Math.PI;
	}
	// Rotate light source
	light[0] = Math.sin(theta);
	light[2] = Math.cos(theta);
	
	gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT);

	// EyePos - Change
	modelViewMatrix = mult(lookAt(vec3(0.0, 1.0, 1.5), at, up), translate(0, 0, 0));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

	gl.depthFunc(gl.ALWAYS);
    gl.disable(gl.BLEND);
    
	//Draw ground + squares
    gl.drawArrays(gl.TRIANGLES, 0, 18);
	
	gl.depthFunc(gl.GREATER);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
	// Model-view matrix for shadow then render
	modelViewMatrix = mult(modelViewMatrix, translate(light[0], light[1], light[2]));
	modelViewMatrix = mult(modelViewMatrix, m);
	modelViewMatrix = mult(modelViewMatrix, translate(-light[0], -light[1], -light[2]));
	
	// Send color and matrix for shadow
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	
	gl.drawArrays(gl.TRIANGLES, 18, 12);

	
	//Redraw
	requestAnimFrame(render);
	
}