var gl;
var modelViewMatrixLoc, projectionMatrixLoc;
var modelViewMatrix, projectionMatrix;

const at = vec3(0.0, 1.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var xleft = -5.0;
var xright = 5.0;
var ytop = 10.0;
var ybottom = -6.0;
var near = -500;
var far = 500;

var lightAmbient = vec4(0.1, 0.1, 0.1, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var lightPosition = vec4(0.0, 15.0, 25.0, 0.0);
var materialShininess = 5.0;

var model = new Object();

window.onload = function init() {
	var canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext("webgl");
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

	gl.enable(gl.DEPTH_TEST);
	
	// Load shaders and initialize attribute buffers
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	
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
	
	// Read Teapot
	readOBJFile("teapot.obj", gl, model, 2, true);
	
	gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
	
	// Keep on rendering
	var renderFunction = function() {
        render();
        requestAnimationFrame(renderFunction, canvas);
    };
    
    renderFunction();
}

function render() {
	
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
	gl.uniformMatrix4fv(projectionMatrixLoc, false,	flatten(projectionMatrix));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
	gl.uniform4fv(lightDiffuseLoc, flatten(lightDiffuse));
	gl.uniform4fv(lightAmbientLoc, flatten(lightAmbient));
	gl.uniform4fv(lightSpecularLoc, flatten(lightSpecular));

	// Draw
	gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
	
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