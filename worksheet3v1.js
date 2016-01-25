
var canvas;
var gl;

var numVertices = 36;

var eye = vec3(0,1,0);
var at = vec3(1,0,1);
var up = vec3(0,1,0);

var pointsArray = [];
var colorsArray = [];

var vertices = [
        vec4( -0.0, -0.0,  1.0, 1.0 ),
        vec4( -0.0,  1.0,  1.0, 1.0 ),
        vec4( 1.0,  1.0,  1.0, 1.0 ),
        vec4( 1.0, -0.0,  1.0, 1.0 ),
        vec4( -0.0, -0.0, -0.0, 1.0 ),
        vec4( -0.0,  1.0, -0.0, 1.0 ),
        vec4( 1.0,  1.0, -0.0, 1.0 ),
        vec4( 1.0, -0.0, -0.0, 1.0 ),
    ];

var vertexColors = [
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
        vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
        vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
        vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
        vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan
        vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    ];

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     pointsArray.push(vertices[d]);
     colorsArray.push(vertexColors[a]);
}

// Each face determines two triangles

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

window.onload = function()
{
	canvas=document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
	
	colorCube();
	
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	var mvMatrix = lookAt(eye,at,up);
	gl.uniformMatrix4fv(gl.getUniformLocation(program,"modelView"),false,flatten(mvMatrix));
	
	
	render();
}

var render = function()
{
	gl.clear( gl.COLOR_BUFFER_BIT);
	
	gl.drawArrays(gl.LINE_STRIP,0,36);
	requestAnimFrame(render);
}