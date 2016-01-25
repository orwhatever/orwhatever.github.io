
var gl;

var mvMatrix = mat4();
var pMatrix = mat4();
var mvloc = null;
var ploc = null;
var transloc = null;
var refloc = null;

var at = vec3(0.0,0,-3.0);
var up = vec3(0.0,1.0,0.0);
var eye = vec3(0,0,1);
var transform;

var reflection;

var points = [];
var texCoords = [];
var numPoints = 0;


var fovy = 65.0;
var aspect;

var right = 3;
var left = -3;
var ytop = 3;
var bot = -3;

var shadowMatrix;

var lightpos = vec4(0,-3,0,1);

var far = 8;
var near = 0.01;

var prog1;
var prog2;

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


 
 window.onload = function()
 {
	
	
	var canvas=document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL( canvas, {alpha: false, stencil: true} );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
	
	quad(quad1[0],quad1[1],quad1[2],quad1[3]);

    aspect =  canvas.width/canvas.height;
	
    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
 
 	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
	program.a_Position = gl.getAttribLocation(program,"vPosition");
	program.a_Normal = gl.getAttribLocation(program,"vNormal");
	program.a_Color	= gl.getAttribLocation(program,"vColor");
	
	program.model = initVertexBuffers(gl, program);
	
	readOBJFile("teapot.obj", gl, program.model, 0.25, false);
	mvloc = gl.getUniformLocation(program,"modelView");
	ploc = gl.getUniformLocation(program,"projection");
	transloc = gl.getUniformLocation(program,"translation");
	refloc = gl.getUniformLocation(program,"ref");
	offsetloc = gl.getUniformLocation(program,"yoffset");
	
	transform = mat4();
	transform[0][3] = 0;
	transform[1][3] = -1;
	transform[2][3] = -3;
	
	var planeNormal = vec3(0,1,0);
	var planePoint = vec3(0,-1,0);
	
	reflection = mat4();
	reflection[0][0] = 1;
	reflection[1][1] = 1 - 2*(planeNormal[1]*planeNormal[1]);
	reflection[2][2] = 1;
	reflection[1][3] = 2*dot(planePoint,planeNormal)*planeNormal[1];
	reflection[3][3] = 1;
	
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
 var dir = false;

function modifyProjectionMatrix(clipplane, projection)
{
	var oblique = mult(mat4(),projection);
	var q = vec4(	(sign(clipplane[0]) + projection[0][2])/projection[0][0],
					(sign(clipplane[1]) + projection[1][2])/projection[1][1],
					-1.0,
					(1.0 + projection[2][2])/projection[2][3]);
	var s = 2.0/dot(clipplane,q);
	oblique[2] = vec4(clipplane[0]*s,clipplane[1]*s,clipplane[2]*s + 1.0, clipplane[3]*s);
	
	return oblique;
}
function sign(x) { return x > 0.0 ? 1.0 : (x < 0.0 ? -1.0 : 0.0);}

var plane = vec4(0,-1,0,-1);
 
 var render = function()
 {
	if(dir)
	{
		rads += 0.005;
		if(rads > 1.0)
		{
			dir = !dir;
		}
	}
	else
	{
		rads -= 0.005;
		if(rads < -0.8)
		{
			dir = !dir;
		}
	}
	gl.useProgram(prog1);
	gl.uniform1f(offsetloc,rads);
	
	gl.clearStencil(0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);
	gl.disable(gl.STENCIL_TEST);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,prog1.model.vertexBuffer);
	gl.vertexAttribPointer(prog1.a_Position,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(prog1.a_Position);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, prog1.model.normalBuffer);
	gl.vertexAttribPointer(prog1.a_Normal,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(prog1.a_Normal);
 
	gl.uniformMatrix4fv(transloc,false,flatten(transform));
	 
	
	var R = mat4();
	
	mvMatrix = lookAt(eye,at,up);
	pMatrix = perspective(fovy, aspect, near, far);
	//pMatrix = ortho(left, right, bot, ytop, near, far);
	gl.uniformMatrix4fv(mvloc, false, flatten(mvMatrix));
	gl.uniformMatrix4fv(ploc, false, flatten(pMatrix));
	gl.uniformMatrix4fv(refloc,false,flatten(R));

	gl.drawElements(gl.TRIANGLES,g_drawingInfo.indices.length,gl.UNSIGNED_SHORT,g_drawingInfo.indices);
	
	gl.useProgram(prog2);
	
	gl.enable(gl.STENCIL_TEST);
	gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
	gl.stencilFunc(gl.ALWAYS, 1, ~0);
	gl.colorMask(0,0,0,0);

	gl.uniformMatrix4fv(prog2.mvloc, false, flatten(mvMatrix));
	gl.uniformMatrix4fv(prog2.ploc, false, flatten(pMatrix));
	
	gl.bindBuffer(gl.ARRAY_BUFFER,prog2.vertexBuffer);
	gl.vertexAttribPointer(prog2.a_Position,4,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(prog2.a_Position);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, prog2.texBuffer);
	gl.vertexAttribPointer(prog2.a_texCoord,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(prog2.a_texCoord);

	gl.drawArrays(gl.TRIANGLES,0,6);
	
	gl.depthRange(1,1);
	gl.depthFunc(gl.ALWAYS);
	gl.stencilFunc(gl.EQUAL, 1, ~0);
	gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
	
	gl.drawArrays(gl.TRIANGLES,0,6);
	
	gl.depthFunc(gl.LESS);
	gl.colorMask(1,1,1,1);
	gl.depthRange(0,1);
	

	
	//gl.drawArrays(gl.TRIANGLES,0,6);
	
	gl.useProgram(prog1);
	
	//gl.colorMask(0,0,0,0);
	//gl.stencilOp(gl.KEEP,gl.KEEP,gl.KEEP);
	//gl.depthFunc(gl.ALWAYS);
	
	gl.bindBuffer(gl.ARRAY_BUFFER,prog1.model.vertexBuffer);
	gl.vertexAttribPointer(prog1.a_Position,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(prog1.a_Position);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, prog1.model.normalBuffer);
	gl.vertexAttribPointer(prog1.a_Normal,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(prog1.a_Normal);
	
	R = reflection;
	
	var p = plane;
	
	pMatrix = modifyProjectionMatrix(p,pMatrix);
	gl.uniformMatrix4fv(mvloc, false, flatten(mvMatrix));
	gl.uniformMatrix4fv(ploc, false, flatten(pMatrix));
	gl.uniformMatrix4fv(refloc,false,flatten(R));
	

	
	gl.drawElements(gl.TRIANGLES,g_drawingInfo.indices.length,gl.UNSIGNED_SHORT,g_drawingInfo.indices);

	gl.useProgram(prog2);
	
	gl.uniformMatrix4fv(prog2.mvloc, false, flatten(mvMatrix));
	gl.uniformMatrix4fv(prog2.ploc, false, flatten(pMatrix));
	
	gl.bindBuffer(gl.ARRAY_BUFFER,prog2.vertexBuffer);
	gl.vertexAttribPointer(prog2.a_Position,4,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(prog2.a_Position);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, prog2.texBuffer);
	gl.vertexAttribPointer(prog2.a_texCoord,2,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(prog2.a_texCoord);

	gl.drawArrays(gl.TRIANGLES,0,6);
	
	gl.depthFunc(gl.LESS);
	gl.colorMask(1,1,1,1);
	
	requestAnimFrame(render);
 }
