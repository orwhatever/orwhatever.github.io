
var canvas;
var gl;

var points = [];

var visibility;
var pmatrix;

var left = -2.5;
var right = 3.5;
var bottom = -1;
var ytop = 1.5;
var near = -5;
var far = 6;

var at = vec3(-2.0,-1.5,-1.0);
var up = vec3(0.0,1.0,0.0);
var eye = vec3(0.0,-1.0,-2.5);


var numPoints = 0;

var rads = 0;
var lightpos = vec3(0,2,-2);
var shadowMatrix = mat4();

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

var quad2 = [
	vec4(0.25,-0.5,-1.75,1),
	vec4(0.75,-0.5,-1.75,1),
	vec4(0.75,-0.5,-1.25,1),
	vec4(0.25,-0.5,-1.25,1)
];

var quad3 = [
	vec4(-1,-1,-3,1),
	vec4(-1,0,-3,1),
	vec4(-1,0,-2.5,1),
	vec4(-1,-1,-2.5,1)
];

var texCoords = [];
var ilocation;

window.onload = function()
{
	canvas=document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL( canvas, {alpha : false} );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
	
	quad(quad1[0],quad1[1],quad1[2],quad1[3]);
	quad(quad2[0],quad2[1],quad2[2],quad2[3]);
	quad(quad3[0],quad3[1],quad3[2],quad3[3]);
	
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
	var tBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW );
	
	var tCoord = gl.getAttribLocation( program, "texCoord");
	gl.vertexAttribPointer( tCoord, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( tCoord );
	
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	var image = document.createElement('img');
	image.crossOrigin = 'anonymous';
	image.onload = function () {
		texture = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D,texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.uniform1i(gl.getUniformLocation(program,"texMap1"),0);
	};
	image.src = 'xamp23.png';
	
	texture2 = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D,texture2);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,0,0,255]));
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D,texture2);
	gl.uniform1i(gl.getUniformLocation(program,"texMap2"),1);
	
	ilocation = gl.getUniformLocation(program,"i");
	
	shadowMatrix[3][3] = 0.0;
	shadowMatrix[3][1] = -1.0/(lightpos[1] + 1.0001);
	
    perspectiveMatrix = gl.getUniformLocation( program, "projection" );
	modelViewMatrix = gl.getUniformLocation(program, "modelView");
	
	visibility = gl.getUniformLocation(program,"visibility");
	gl.uniform1f(visibility,0.3);
	
	mvMatrix = mat4();
	gl.uniformMatrix4fv(modelViewMatrix,false,flatten(mvMatrix));
	pMatrix = ortho(left, right, bottom, ytop, near, far);
	gl.uniformMatrix4fv(perspectiveMatrix,false,flatten(pMatrix));
	
	glval = gl.LESS;
	
	render();
}


var render = function()
{
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	
	
	rads += 0.1;
	if(rads > 2*Math.PI)
	{
		rads -= 2*Math.PI;
	}
	
	gl.depthFunc(gl.LESS);
	
	mvMatrix = lookAt(eye, at, up);	
	gl.uniformMatrix4fv(modelViewMatrix,false,flatten(mvMatrix));
	
	gl.uniform1i(ilocation,0);
	gl.drawArrays(gl.TRIANGLES,0,6);
	


	lightpos = vec3(0+2*Math.sin(rads),2,-2+2*Math.cos(rads));
	
	
	mvMatrix = mult(mvMatrix, translate(lightpos[0],lightpos[1],lightpos[2]));
	mvMatrix = mult(mvMatrix,shadowMatrix);
	mvMatrix = mult(mvMatrix, translate(-lightpos[0],-lightpos[1],-lightpos[2]));
	
	gl.depthFunc(gl.GREATER);
	
	gl.uniformMatrix4fv(modelViewMatrix,false,flatten(mvMatrix));
	gl.uniform1i(ilocation,2);
	gl.drawArrays(gl.TRIANGLES,6,12);

	mvMatrix = lookAt(eye, at, up);	
	gl.uniformMatrix4fv(modelViewMatrix,false,flatten(mvMatrix));
	
	gl.depthFunc(gl.LESS);
	
	gl.uniform1i(ilocation,1);
	gl.drawArrays(gl.TRIANGLES,6,12);
	
	
	requestAnimFrame(render);
}