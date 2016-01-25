
var canvas;
var gl;

var numvertices=4;

var pointsArray=[];
var colorsArray=[];
var texArray=[];

var texSize = 64;
var numRows = 8;
var numCols = 8;

var tex1;

var texCoord = [
 vec2(-1.5,0.0),
 vec2(2.5,0.0),
 vec2(2.5,10.0),
 vec2(-1.5,10.0)
];


var myTexels = new Uint8Array(4*texSize*texSize);

var vertices=[
	vec4(-4,-1,-1,1),
	vec4(4,-1,-1,1),
	vec4(4,-1,-21,1),
	vec4(-4,-1,-21,1),
	];
	
var colors=[
	vec4(1,1,1,1),
	vec4(1,1,1,1),
	vec4(1,1,1,1),
	vec4(1,1,1,1),
	];
	
var perspectiveMatrix,pMatrix;


var program;

var fovy = 90;
var aspect = 1;
var near = 0.1;
var far = 30;

window.onload = function()
{
	canvas=document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    aspect =  canvas.width/canvas.height;
    
    gl.clearColor( 0.0, 0.0, 1.0, 1.0 );
	
	pointsArray=vertices;
	colorsArray=colors;
	
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	var tBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoord), gl.STATIC_DRAW);
	
	var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
	gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vTexCoord);
	
    perspectiveMatrix = gl.getUniformLocation( program, "projection" );
	
	document.getElementById("Button1").onclick =
	function(){
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	}
	
	document.getElementById("Button2").onclick =
	function(){
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	}
	document.getElementById("Button3").onclick =
	function(){
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	}
	document.getElementById("Button4").onclick =
	function(){
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	}
	document.getElementById("Button5").onclick =
	function(){
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
	}
	
	tex1 = gl.createTexture();
	
	gl.bindTexture(gl.TEXTURE_2D,tex1);
	gl.activeTexture(gl.TEXTURE0);
	
	fillTexels();
	
	var eye = vec3(0,0,0);
	var at = vec3(0,0,-1);
	var up = vec3(0,1,0);
	
	var mvMatrix = mat4();
	mvMatrix = lookAt(eye,at,up);
	
	gl.uniformMatrix4fv(gl.getUniformLocation(program,"modelView"),false,flatten(mvMatrix));
	
	
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, myTexels);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
	render();
}

var fillTexels = function()
{
	for(var i = 0; i < texSize; i++)
	{
		for(var j = 0; j < texSize; j++)
		{
			var patchx = Math.floor(i/(texSize/numRows));
			var patchy = Math.floor(j/(texSize/numCols));
			
			var c = 0;
			if(patchx%2 ^ patchy%2) c = 255;
			
			myTexels[4*i*texSize + 4*j] = c;
			myTexels[4*i*texSize + 4*j+1] = c;
			myTexels[4*i*texSize + 4*j+2] = c;
			myTexels[4*i*texSize + 4*j+3] = 255;
		}
	}
}

var render = function()
{
	gl.clear( gl.COLOR_BUFFER_BIT);
	pMatrix=perspective(fovy,aspect,near,far);
	
	gl.uniformMatrix4fv(perspectiveMatrix,false,flatten(pMatrix));
	
	gl.drawArrays(gl.TRIANGLES,0,numvertices);
	requestAnimFrame(render);
}