
var gl;

var mvMatrix = mat4();
var pMatrix = mat4();

var at = vec3(0.0,0.25,-0.25);
var up = vec3(0.0,1.0,0.0);
var eye = vec3(0,0.75,1);

var fovy = 90.0;
var aspect;

var right = 1;
var left = -1;
var ytop = 1;
var bot = -1;

var points = [];
var texCoords = [];
var numPoints = 0;

var lightAmbient = vec4(0.2,0.2,0.2,1.0);
var lightDiffuse = vec4(1.0,1.0,1.0,1.0);

var materialAmbient = vec4(0.2,0.2,0.2,1);
var materialDiffuse = vec4(0.8,0.8,0.8,1);

var shadowMatrix = mat4();
var fromLightMatrix = mat4();


var prog1;
var prog2;
var prog3;

var fbo;


function quad(a, b, c, d)
{

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];
	texCoords.push(vec2(0,0),vec2(1,0),vec2(1,1),vec2(0,0),vec2(1,1),vec2(0,1));
    for ( var i = 0; i < indices.length; ++i ) {
        points.push( indices[i] );
		numPoints++;
    }
}

var quad1 = [
	vec4(-2,-1,-5,1),
	vec4(2,-1,-5,1),
	vec4(2,-1,-1,1),
	vec4(-2,-1,-1,1)
];

var lightpos = vec4(0,2,0,1);

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
	
	quad(quad1[0],quad1[1],quad1[2],quad1[3]);
 
 	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
	program.a_Position = gl.getAttribLocation(program,"vPosition");
	program.a_Normal = gl.getAttribLocation(program,"vNormal");
	program.a_Color	= gl.getAttribLocation(program,"vColor");
	
	var model = initVertexBuffers(gl, program);
	
	readOBJFile("teapot.obj", gl, model, 0.25, false);
	program.mvloc = gl.getUniformLocation(program,"modelView");
	program.ploc = gl.getUniformLocation(program,"projection");
	program.iloc = gl.getUniformLocation(program,"i");
	program.lightloc = gl.getUniformLocation(program,"lightPosition");
	
    gl.uniform4fv( program.lightloc,flatten(lightpos) );
	
	program.model = model;
	prog1 = program;
	
	program = initShaders( gl, "vertex-shader2", "fragment-shader2");
	gl.useProgram(program);
	
	program.a_Position = gl.getAttribLocation(program,"vPosition");
	program.vertexBuffer = createEmptyArrayBuffer(gl, program.a_Position, 4, gl.FLOAT);
	program.a_texCoord = gl.getAttribLocation(program,"texCoord");
	program.texBuffer = createEmptyArrayBuffer(gl, program.a_texCoord, 2, gl.FLOAT);
	
	program.tex1 = gl.getUniformLocation(program,"texMap1");
	program.tex2 = gl.getUniformLocation(program,"texMap2");
	program.iloc = gl.getUniformLocation(program,"i");
	program.ploc = gl.getUniformLocation(program,"projection");
	program.mvloc = gl.getUniformLocation(program,"modelView");
	
	gl.bindBuffer(gl.ARRAY_BUFFER,program.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,flatten(points), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER,program.texBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,flatten(texCoords), gl.STATIC_DRAW);
	
	shadowMatrix[3][3] = 0.0;
	shadowMatrix[3][1] = -1.0/lightpos[1];
	shadowMatrix[0][0] = 1.5;
	shadowMatrix[1][1] = 1.501;
	shadowMatrix[2][2] = 1.5;
	
	var image = document.createElement('img');
	image.crossOrigin = 'anonymous';
	image.onload = function () {
		gl.useProgram(prog2);
		texture = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D,texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.uniform1i(prog2.tex1,0);
		gl.uniform1i(prog2.tex2,1);
	};
	image.src = 'xamp23.png';
	
	prog2 = program;
	
	program = initShaders(gl, "vertex-shadow", "fragment-shadow");
	
	program.modeloc = gl.getUniformLocation(program,"mode");
	program.mvloc = gl.getUniformLocation(program,"modelView");
	program.a_Position = gl.getAttribLocation(program,"vPosition");
	
	prog3 = program;
	
	fbo = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
	
	fbo.texture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.generateMipmap(gl.TEXTURE_2D);
	fbo.renderbuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, fbo.renderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 512, 512);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER, fbo.renderbuffer);
	
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fbo.texture, 0);
	
	gl.bindFramebuffer(gl.FRAMEBUFFER,null);
	gl.bindRenderbuffer(gl.RENDERBUFFER,null);
	
	
	
	gl.useProgram(prog1);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,model.vertexBuffer);
	gl.vertexAttribPointer(prog1.a_Position,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(prog1.a_Position);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
	gl.vertexAttribPointer(prog1.a_Color,4,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(prog1.a_Color);
	
 
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
	rads += 0.05;
	if(rads > Math.PI*2) rads -= Math.PI*2;

	lightpos[0] = Math.cos(rads);
	lightpos[2] = Math.sin(rads);
	
	mvMatrix = lookAt(vec3(lightpos[0],lightpos[1],lightpos[2]),at,up);
	var mvMat2 = mvMatrix;
	pMatrix = perspective(90, 1, 0.01, 10);
	var pMat2 = pMatrix;
	
	gl.useProgram(prog3);
	
	gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,prog2.vertexBuffer);
	gl.vertexAttribPointer(prog3.a_Position,4,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(prog3.a_Position);
	
	gl.uniform1i(prog3.modeloc,0);
	gl.uniformMatrix4fv(prog3.mvloc,false,flatten(mvMatrix));
	gl.uniformMatrix4fv(gl.getUniformLocation(prog3,"projection"),false,flatten(pMatrix));
	
	//gl.drawArrays(gl.TRIANGLES,0,6);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,prog1.model.vertexBuffer);
	gl.vertexAttribPointer(prog3.a_Position,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(prog3.a_Position);
	
	gl.uniform1i(prog3.modeloc,1);
	
	gl.drawElements(gl.TRIANGLES,g_drawingInfo.indices.length,gl.UNSIGNED_SHORT,g_drawingInfo.indices);
	
	gl.bindFramebuffer(gl.FRAMEBUFFER,null);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	gl.useProgram(prog2);
	
	mvMatrix = lookAt(eye,at,up);
	pMatrix = ortho(left, right, bot, ytop, near, far);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,prog2.vertexBuffer);
	gl.vertexAttribPointer(prog2.a_Position,4,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(prog2.a_Position);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, prog2.texBuffer);
	gl.vertexAttribPointer(prog2.a_texCoord,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(prog2.a_texCoord);
	
	gl.uniform1i(prog2.iloc,0);
	gl.uniformMatrix4fv(prog2.mvloc, false, flatten(mvMatrix));
	gl.uniformMatrix4fv(prog2.ploc, false, flatten(pMatrix));
	
	gl.uniformMatrix4fv(gl.getUniformLocation(prog2,"modelViewLight"),false,flatten(mvMat2));
	gl.uniformMatrix4fv(gl.getUniformLocation(prog2,"projectionLight"),false,flatten(pMat2));
	
	gl.drawArrays(gl.TRIANGLES,0,6);
	
	gl.useProgram(prog1);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,prog1.model.vertexBuffer);
	gl.vertexAttribPointer(prog1.a_Position,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(prog1.a_Position);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, prog1.model.colorBuffer);
	gl.vertexAttribPointer(prog1.a_Color,4,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(prog1.a_Color);
	
    gl.uniform4fv( prog1.lightloc,flatten(lightpos) );

	gl.uniformMatrix4fv(prog1.mvloc, false, flatten(mvMatrix));
	gl.uniformMatrix4fv(prog1.ploc, false, flatten(pMatrix));
	gl.uniform1i(prog1.iloc,0);
	
	gl.drawElements(gl.TRIANGLES,g_drawingInfo.indices.length,gl.UNSIGNED_SHORT,g_drawingInfo.indices);
	
	mvMatrix = mult(mvMatrix, translate(lightpos[0],lightpos[1],lightpos[2]));
	mvMatrix = mult(mvMatrix,shadowMatrix);
	mvMatrix = mult(mvMatrix, translate(-lightpos[0],-lightpos[1],-lightpos[2]));
	
	gl.uniformMatrix4fv(prog1.mvloc, false, flatten(mvMatrix));
	gl.uniform1i(prog1.iloc,1);

	gl.depthFunc(gl.GREATER);
	//gl.drawElements(gl.TRIANGLES,g_drawingInfo.indices.length,gl.UNSIGNED_SHORT,g_drawingInfo.indices);
	gl.depthFunc(gl.LESS);

	mvMatrix = lookAt(eye,at,up);
	gl.uniformMatrix4fv(prog1.mvloc, false, flatten(mvMatrix));
	gl.uniform1i(prog1.iloc,0);
	
	//gl.drawElements(gl.TRIANGLES,g_drawingInfo.indices.length,gl.UNSIGNED_SHORT,g_drawingInfo.indices);
	
	
	requestAnimFrame(render);
 }
