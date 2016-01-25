
var gl;

var mvMatrix = mat4();
var pMatrix = mat4();
var mvloc = null;
var ploc = null;

var at = vec3(0.0,0,0);
var up = vec3(0.0,1.0,0.0);
var eye = vec3(0,0.5,1);

var fovy = 90.0;
var aspect;

var right = 3;
var left = -3;
var ytop = 3;
var bot = -3;

var lightpos = vec4(0,2,-8,1);

var far = 8;
var near = -3;
 
 window.onload = function()
 {
	
	
	var canvas=document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
	gl.enable(gl.DEPTH_TEST);

    aspect =  canvas.width/canvas.height;
	
    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
 
 	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
	program.a_Position = gl.getAttribLocation(program,"vPosition");
	program.a_Normal = gl.getAttribLocation(program,"vNormal");
	program.a_Color	= gl.getAttribLocation(program,"vColor");
	
	var model = initVertexBuffers(gl, program);
	
	readOBJFile("teapot.obj", gl, model, 1, false);
	mvloc = gl.getUniformLocation(program,"modelView");
	ploc = gl.getUniformLocation(program,"projection");

    gl.uniform4fv( gl.getUniformLocation(program,
      "lightPosition"),flatten(lightpos) );
 
 }
 
 function initVertexBuffers(gl, program)
 {
	var o = new Object();
	o.vertexBuffer = createEmptyArrayBuffer(gl,program.a_Position,3,gl.FLOAT);
 	o.normalBuffer = createEmptyArrayBuffer(gl,program.a_Normal,3,gl.FLOAT);
	o.colorBuffer = createEmptyArrayBuffer(gl,program.a_Color,4,gl.FLOAT);
	o.indexBuffer = gl.createBuffer();
	return o;
 }
 
 function createEmptyArrayBuffer(gl, a_attribute, num, type)
 {
	 var buffer = gl.createBuffer();
	 gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
	 gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
	 gl.enableVertexAttribArray(a_attribute);
	 
	 return buffer;
	 
 }

function readOBJFile(fileName, gl, model, scale, reverse)
{
	var request = new XMLHttpRequest();
	request.onreadystatechange = function()
	{
		if(request.readyState == 4 && request.status != 404)
		{
			onReadObjFile(request.responseText,fileName,gl,model,scale,reverse);
			onReadComplete(gl, model, g_objDoc);
		}
	}
	request.open("GET",fileName,true);
	request.send();
}

var g_objDoc = null;
var g_drawingInfo = null;

function onReadObjFile(fileString, fileName, gl, o, scale, reverse)
{
	var objDoc = new OBJDoc(fileName);
	var result = objDoc.parse(fileString,scale,reverse);
	if(!result)
	{
		g_objDoc = null; g_drawingInfo = null;
		console.log("OBJ file parsing error!");
		return;
	}
	g_objDoc = objDoc;
}

function onReadComplete(gl, model, objDoc)
{
	var drawingInfo = objDoc.getDrawingInfo();
	
	gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);
	
	g_drawingInfo = drawingInfo;
	render();
}
 
 var numToDraw = 3;
 
 var rads = 0;
 
 var render = function()
 {
	 rads = rads + 0.005;
	 if(rads > 2*Math.PI) rads -= 2*Math.PI;
	 
	 eye[0] = Math.cos(rads);
	 eye[2] = Math.sin(rads);
	 
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	mvMatrix = lookAt(eye,at,up);
	//pMatrix = perspective(fovy, aspect, far, near);
	pMatrix = ortho(left, right, bot, ytop, near, far);
	gl.uniformMatrix4fv(mvloc, false, flatten(mvMatrix));
	gl.uniformMatrix4fv(ploc, false, flatten(pMatrix));
	
	gl.drawElements(gl.TRIANGLES,g_drawingInfo.indices.length,gl.UNSIGNED_SHORT,g_drawingInfo.indices);
	requestAnimFrame(render);
 }
