var gl;
var modelViewMatrixLoc, projectionMatrixLoc;
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc2, projectionMatrixLoc2;
var modelViewMatrix2, projectionMatrix2;

// Vars for lootAt
const at = vec3(0.0, 1.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// Vars for ortho
var xleft = -5.0;
var xright = 5.0;
var ytop = 10.0;
var ybottom = -6.0;
var near = -500;
var far = 500;

// Plane
var planeColor = vec4(1.0, 1.0, 1.0,1.0);
var va = vec3(-2.0, -1.0, -1.0);
var vb = vec3(2.0, -1.0, -1.0);
var vc = vec3(2.0, -1.0, -5.0);
var vd = vec3(-2.0, -1.0, -5.0);

var colorsArray = [];
var vertices = [];

// Tex Cords
var texCoordsArray = [];
var texCoord = [
	vec2(0.0, 0.0),
	vec2(1.0, 0.0),
	vec2(1.0, 1.0),
	vec2(0.0, 1.0)
];

// Light
var lightAmbient = vec4(0.1, 0.1, 0.1, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var lightPosition = vec4(0.0, 15.0, 25.0, 0.0);
var materialShininess = 5.0;

function configureTexture(image) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    gl.uniform1i(gl.getUniformLocation(program2, "texture"), 0);
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

var model = new Object();

window.onload = function init() {
	// Init septup
	var canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext("webgl");
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

	gl.enable(gl.DEPTH_TEST);
	//gl.enable(gl.BLEND);
	
	// Create plane
	quad(va,vb,vc,vd,planeColor);
	
	/////////////////////
	// ## PROGRAM 2 ## //
	/////////////////////
	
	// Load shaders and initialize attribute buffers for program 2
	program2 = initShaders(gl, "vertex-shader2", "fragment-shader2");
	gl.useProgram(program2);
	
	// var program2 = createProgram(gl, "vertex-shader2", "fragment-shader2");
	
	// Create locators for program 2
	modelViewMatrixLoc2 = gl.getUniformLocation(program2, "modelViewMatrix2");
	projectionMatrixLoc2 = gl.getUniformLocation(program2, "projectionMatrix2");
	
	// Write to GPU with vertices for program 2
	var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    var vPosition2 = gl.getAttribLocation(program2, "vPosition2");
    gl.vertexAttribPointer(vPosition2, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition2);
	
	// Write to GPU with colors for program 2
	var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
    var vColor2 = gl.getAttribLocation(program2, "vColor2");
    gl.vertexAttribPointer(vColor2, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor2);
	
	// Write to GPU with texture for program 2
	var tBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
	var vTexCoord2 = gl.getAttribLocation(program2, "vTexCoord2");
	gl.vertexAttribPointer(vTexCoord2, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vTexCoord2);
	
	// Load Image/Texture
	var image = new Image();
    image.onload = function() {
		configureTexture(image);
    }
    image.src = "xamp23.png";
	
	///////////////////
	// ## PROGRAM ## //
	///////////////////
	
	// Load shaders and initialize attribute buffers
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	
	// var vertexshader = createShaderFromScriptElement(gl, "vertex-shader");
	// var fragmentshader = createShaderFromScriptElement(gl, "fragment-shader");
	// var program = createProgram(gl, [vertexshader, fragmentshader]);
	
	// Create locators
	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
	projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
	lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
	lightDiffuseLoc = gl.getUniformLocation(program, "lightDiffuse");
	lightAmbientLoc = gl.getUniformLocation(program, "lightAmbient");
	lightSpecularLoc = gl.getUniformLocation(program, "lightSpecular");
	
	// Write to GPU with position - Buffer with initial config
	model.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
	// Write to GPU with colors - Buffer with initial config
	model.colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
	
	// Write to GPU with normal - Buffer with initial config
	model.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
	
	// Index/Indices
	model.indexBuffer = gl.createBuffer();
	
	gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
	
	// Read Teapot
	readOBJFile("teapot.obj", gl, model, 2, true);
	
	
	// Keep on rendering
	var renderFunction = function() {
		render2(program2);
		render(program);
        requestAnimationFrame(renderFunction, canvas);
    };
    
    renderFunction();
}

function render(p) {
	
	gl.useProgram(p);
	
	// Check if ready
	if(g_objDoc != null && g_objDoc.isMTLComplete()) {
		g_drawingInfo = onReadComplete(gl, model, g_objDoc);
		g_objDoc = null;
	}
	if(!g_drawingInfo) return; // Not ready
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// EyePos
	modelViewMatrix = mult(lookAt(vec3(2, 1, 2), at, up), translate(0, 0, 0));
	
	// Perspective
	projectionMatrix = ortho(xleft, xright, ybottom, ytop, near, far);
	
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
	gl.uniform4fv(lightDiffuseLoc, flatten(lightDiffuse));
	gl.uniform4fv(lightAmbientLoc, flatten(lightAmbient));
	gl.uniform4fv(lightSpecularLoc, flatten(lightSpecular));

	// Draw Teapot
	//alert(g_drawingInfo.indices.length);
	//alert(g_drawingInfo.vertices.length);
	gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
	
}

function render2(p2) {
	
	gl.useProgram(p2);
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// EyePos
	modelViewMatrix2 = mult(lookAt(vec3(0.0, 1.0, 1.5), at, up), translate(0, 0, 0));
	
	// Perspective
	projectionMatrix2 = perspective(90.0, 1.0, 1, 100.0);
	
	gl.uniformMatrix4fv(projectionMatrixLoc2, false, flatten(projectionMatrix2));
	gl.uniformMatrix4fv(modelViewMatrixLoc2, false, flatten(modelViewMatrix2));
	
	// Draw Plane
	gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
	
}

// Read a file
function readOBJFile(fileName, gl, model, scale, reverse) {
    var request = new XMLHttpRequest();
    
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status !== 404) {
            onReadOBJFile(request.responseText, fileName, gl, model, scale, reverse);
        }
    }
    request.open('GET', fileName, true); // Create a request to acquire the file
    request.send();                      // Send the request
}

var g_objDoc = null;      // The information of OBJ file
var g_drawingInfo = null; // The information for drawing 3D model

// OBJ File has been read
function onReadOBJFile(fileString, fileName, gl, o, scale, reverse) {
    var objDoc = new OBJDoc(fileName);  // Create a OBJDoc object
    var result = objDoc.parse(fileString, scale, reverse);
    if (!result) {
        g_objDoc = null; g_drawingInfo = null;
        console.log("OBJ file parsing error.");
        return;
    }
    g_objDoc = objDoc;
}

// OBJ File has been read compreatly
function onReadComplete(gl, model, objDoc) {
    // Acquire the vertex coordinates and colors from OBJ file
    var drawingInfo = objDoc.getDrawingInfo();
    
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);
    
    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);
    
    return drawingInfo;
}