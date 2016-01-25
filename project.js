
var gl;
var points;

var NumVertices = 0;
var curVertex = 0;

var vertexBuffer;
var normalsBuffer;
var colorBuffer;

var vertexInfo = [];
var vertexCount = 0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var vertices = [
	vec4( -0.5, -0.5,  0.5, 1.0 ),
	vec4( -0.5,  0.5,  0.5, 1.0 ),
	vec4(  0.5,  0.5,  0.5, 1.0 ),
	vec4(  0.5, -0.5,  0.5, 1.0 ),
	vec4( -0.5, -0.5, -0.5, 1.0 ),
	vec4( -0.5,  0.5, -0.5, 1.0 ),
	vec4(  0.5,  0.5, -0.5, 1.0 ),
	vec4(  0.5, -0.5, -0.5, 1.0 )
];

function triangle(a, b, c) {

     points.push(a);
     points.push(b);
     points.push(c);
	 
	 colors.push(vertexColors[0]);
	 colors.push(vertexColors[1]);
	 colors.push(vertexColors[2]);

     // normals are vectors

     normalsArray.push(a[0],a[1], a[2], 0.0);
     normalsArray.push(b[0],b[1], b[2], 0.0);
     normalsArray.push(c[0],c[1], c[2], 0.0);


}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
	for(var i = vertexCount; i < vertexCount + 4; i++) vertexInfo[i] = [];
	vertexPositions.push(vec3(a[0],a[1],a[2]));
	vertexPositions.push(vec3(b[0],b[1],b[2]));
	vertexPositions.push(vec3(c[0],c[1],c[2]));
	vertexPositions.push(vec3(d[0],d[1],d[2]));
	
    divideTriangle(a, b, c, n);
	vertexInfo[vertexCount + 0].push(curVertex);
	vertexInfo[vertexCount + 1].push(curVertex+1);
	vertexInfo[vertexCount + 2].push(curVertex+2);
	curVertex+=3;
	NumVertices+=3;
    divideTriangle(d, c, b, n);
	vertexInfo[vertexCount + 3].push(curVertex);
	vertexInfo[vertexCount + 2].push(curVertex+1);
	vertexInfo[vertexCount + 1].push(curVertex+2);
	curVertex+=3;
	NumVertices+=3;
    divideTriangle(a, d, b, n);
	vertexInfo[vertexCount + 0].push(curVertex);
	vertexInfo[vertexCount + 3].push(curVertex+1);
	vertexInfo[vertexCount + 1].push(curVertex+2);
	curVertex+=3;
	NumVertices+=3;
    divideTriangle(a, c, d, n);
	vertexInfo[vertexCount + 0].push(curVertex);
	vertexInfo[vertexCount + 2].push(curVertex+1);
	vertexInfo[vertexCount + 3].push(curVertex+2);
	curVertex+=3;
	NumVertices+=3;
	vertexCount += 4;
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
}

var vertexPositions = [
];

var selectedVertex;

var frameBuffer;
var rb;

var pointsArray = [];
var normalsArray = [];
var colorsArray = [];

var points = [];
var colors = [];

var ilocation;

var mvm;
var pvm;
var modelView;
var projectionView;

var near = -1;
var far = 4;

var x = 0;
var y = 0;
var z = 0;


var radius = 1.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;

var fov = 100;
var aspect = 1;

var eye  = vec3(1.0, 1.0, 1,0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var zoom = 0.0

window.onload = function init()
{
	var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram(program);
	
    colorBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    vertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	//colorCube();
	
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.generateMipmap(gl.TEXTURE_2D);
	
	// Allocate a framebuffer object
	
	frameBuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	var renderbuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 512,512);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
	
	// Attach color bufferData
	
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
	
	// Check for completeness
	
	var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
	if(status != gl.FRAMEBUFFER_COMPLETE)
	{
		alert('Framebuffer not complete');
	}
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER,null);
	
	canvas.addEventListener("mousedown", function(){
	
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.uniformMatrix4fv( modelView, false, flatten(mvm) );
		gl.uniformMatrix4fv( projectionView, false, flatten(pvm) );
		for(var i = 0; i < vertexCount; i++) {
			gl.uniform1f(ilocation, i/255);
			gl.drawArrays(gl.POINTS, vertexInfo[i][0],1);
		}
		
		var x = event.clientX - event.target.getBoundingClientRect().left;
		var y = canvas.height - (event.clientY - event.target.getBoundingClientRect().top);
		
		var color = new Uint8Array(4);
		gl.readPixels(x,y,1,1,gl.RGBA,gl.UNSIGNED_BYTE,color);
		
		console.	log(color[2]);
		console.log(vertexInfo[color[2]]);
		gl.bindFramebuffer(gl.FRAMEBUFFER,null);
		selectedIndex = color[2];
		if(selectedIndex > 	vertexCount) selectedIndex = -1;
		gl.uniform1f(ilocation,0);
		gl.clear(gl.COLOR_BUFFER_BIT);
	
	});
	
	document.getElementById("Cube").onclick = function() {
		colorCube();
	}
	
	document.getElementById("Triangle").onclick = function(){
		tetrahedron(va,vb,vc,vd,0);
	}
	
	document.getElementById("VertexX+").onclick = function() {
		if(selectedIndex >= 0) {
			gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
			var newloc = vertexPositions[selectedIndex];
			newloc[0] += 0.1;
			for(var i = 0; i < vertexInfo[selectedIndex].length; i++) gl.bufferSubData(gl.ARRAY_BUFFER, vertexInfo[selectedIndex][i]*16, flatten(newloc));
		}
	}
	
	document.getElementById("VertexX-").onclick = function() {
		if(selectedIndex >= 0) {
			gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
			var newloc = vertexPositions[selectedIndex];
			newloc[0] -= 0.1;
			for(var i = 0; i < vertexInfo[selectedIndex].length; i++) gl.bufferSubData(gl.ARRAY_BUFFER, vertexInfo[selectedIndex][i]*16, flatten(newloc));
		}
	}
	
	document.getElementById("VertexY+").onclick = function() {
		if(selectedIndex >= 0) {
			gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
			var newloc = vertexPositions[selectedIndex];
			newloc[1] += 0.1;
			for(var i = 0; i < vertexInfo[selectedIndex].length; i++) gl.bufferSubData(gl.ARRAY_BUFFER, vertexInfo[selectedIndex][i]*16, flatten(newloc));
		}
	}
	
	document.getElementById("VertexY-").onclick = function() {
		if(selectedIndex >= 0) {
			gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
			var newloc = vertexPositions[selectedIndex];
			newloc[1] -= 0.1;
			for(var i = 0; i < vertexInfo[selectedIndex].length; i++) gl.bufferSubData(gl.ARRAY_BUFFER, vertexInfo[selectedIndex][i]*16, flatten(newloc));
		}
	}
	
	document.getElementById("VertexZ+").onclick = function() {
		if(selectedIndex >= 0) {
			gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
			var newloc = vertexPositions[selectedIndex];
			newloc[2] += 0.1;
			for(var i = 0; i < vertexInfo[selectedIndex].length; i++) gl.bufferSubData(gl.ARRAY_BUFFER, vertexInfo[selectedIndex][i]*16, flatten(newloc));
		}
	}
	
	document.getElementById("VertexZ-").onclick = function() {
		if(selectedIndex >= 0) {
			gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
			var newloc = vertexPositions[selectedIndex];
			newloc[2] -= 0.1;
			for(var i = 0; i < vertexInfo[selectedIndex].length; i++) gl.bufferSubData(gl.ARRAY_BUFFER, vertexInfo[selectedIndex][i]*16, flatten(newloc));
		}
	}
	
	document.getElementById("Left").onclick = function()
	{
		phi += 0.2;
		if(phi < 0) phi += 2*Math.PI;
		eye[0] = Math.cos(phi);
		eye[2] = Math.sin(phi);
	}
	
	document.getElementById("Right").onclick = function()
	{
		phi -= 0.2;
		if(phi > 2*Math.PI) phi -= 2*Math.PI;
		eye[0] = Math.cos(phi);
		eye[2] = Math.sin(phi);
	}
	
	document.getElementById("Up").onclick = function()
	{
		eye[1] += 0.2;
	}
	
	document.getElementById("Down").onclick = function()
	{
		eye[1] -= 0.2;
	}
	

	eye[0] = Math.cos(phi);
	eye[2] = Math.sin(phi);
	
	selectedIndex = -1;
	
	modelView = gl.getUniformLocation(program, "modelView");
	projectionView = gl.getUniformLocation(program, "projection");
	ilocation = gl.getUniformLocation(program, "i");
	gl.uniform1f(ilocation,0);
	
	render();
}

function colorCube()
{
	for(var i = vertexCount; i < vertexCount + 8; i++) vertexInfo[i] = [];
	for(var i = 0; i < 8; i++) vertexPositions.push(vec3(vertices[i][0],vertices[i][1],vertices[i][2]));
    quad( 1, 0, 3, 2, vertexCount);
    quad( 2, 3, 7, 6, vertexCount );
    quad( 3, 0, 4, 7, vertexCount );
    quad( 6, 5, 1, 2, vertexCount );
    quad( 4, 5, 6, 7, vertexCount );
    quad( 5, 4, 0, 1, vertexCount );
	vertexCount += 8;
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
}

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

function quad(a, b, c, d, offset)
{

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
		vertexInfo[indices[i] + offset].push(curVertex);
		curVertex++;
		NumVertices++;
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//eye = vec3(radius*Math.sin(phi) + x, radius*Math.sin(theta) + y, radius*Math.cos(phi) + z);
	 
	at = vec3(x,y,z);
	
	mvm = lookAt(eye, at , up);
	pvm = ortho(left, right, bottom, ytop, near, far);
	//pvm = perspective(fov,aspect,near,far);

	gl.uniformMatrix4fv( modelView, false, flatten(mvm) );
	gl.uniformMatrix4fv( projectionView, false, flatten(pvm) );
	
	gl.drawArrays( gl.TRIANGLES, 0, NumVertices);
	//gl.drawArrays( gl.LINES, 0, NumVertices);
	gl.drawArrays( gl.POINTS, 0, NumVertices);
	
	requestAnimFrame(render);
	
}