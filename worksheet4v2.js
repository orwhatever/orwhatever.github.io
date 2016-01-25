
var canvas;
var gl;

var aspect = 1;
var fov = 45;
var near = 0.0001;
var far = 5;

var numVertices = 36;

var eye = vec3(0,0,3);
var at = vec3(0,0,0);
var up = vec3(0,1,0);

var index = 0;
var numDivs = 3;

var pointsArray = [];
var normalsArray = [];

var program;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

function triangle(a, b, c) {



     pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);

     // normals are vectors

     normalsArray.push(a[0],a[1], a[2], 0.0);
     normalsArray.push(b[0],b[1], b[2], 0.0);
     normalsArray.push(c[0],c[1], c[2], 0.0);

     index += 3;

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
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

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

window.onload = function init()
{
	canvas=document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	
	tetrahedron(va,vb,vc,vd,numDivs);
	
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	document.getElementById("Button1").onclick = function(){
        numDivs++;
        index = 0;
        pointsArray = [];
        normalsArray = [];
		tetrahedron(va,vb,vc,vd,numDivs);
		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    };
    document.getElementById("Button2").onclick = function(){
        if(numDivs) numDivs--;
        index = 0;
        pointsArray = [];
        normalsArray = [];
		tetrahedron(va,vb,vc,vd,numDivs);
		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    };
	
	render();
}

var rads = 0;

var render = function()
{
	rads += 0.05;
	if(rads > 2*Math.PI) rads -= 2*Math.PI;
	
	eye[0] = 3*Math.sin(rads);
	eye[2] = 3*Math.cos(rads);
	
	gl.clear( gl.COLOR_BUFFER_BIT);
	
	var mvMatrix = lookAt(eye,at,up);
	gl.uniformMatrix4fv(gl.getUniformLocation(program,"modelView"),false,flatten(mvMatrix));	
	
	var pMatrix = perspective(fov,aspect,near,far);
	gl.uniformMatrix4fv(gl.getUniformLocation(program,"projection"),false,flatten(pMatrix));
	
	gl.uniform4fv(gl.getUniformLocation(program,"color"),flatten(vec4(1,0,0,1)));
	
	gl.drawArrays(gl.TRIANGLES,0,index);
	
	requestAnimFrame(render);
}