
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
var lightPosition = vec4(0,0,-1,1);

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 10.0;

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
	
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
	
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	var nBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
	
	var nPosition = gl.getAttribLocation( program, "vNormal" );
	gl.vertexAttribPointer(nPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(nPosition);
	
	document.getElementById("Button1").onclick = function(){
        numDivs++;
        index = 0;
        pointsArray = [];
        normalsArray = [];
		tetrahedron(va,vb,vc,vd,numDivs);
		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
		gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    };
    document.getElementById("Button2").onclick = function(){
        if(numDivs) numDivs--;
        index = 0;
        pointsArray = [];
        normalsArray = [];
		tetrahedron(va,vb,vc,vd,numDivs);
		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
		gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    };
	
	gl.uniform4fv( gl.getUniformLocation(program,
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program,
       "shininess"),materialShininess );
	
	render();
}

var rads = 0;

var render = function()
{
	rads += 0.01;
	if(rads > 2*Math.PI) rads -= 2*Math.PI;
	
	eye[0] = 3*Math.sin(rads);
	eye[2] = 3*Math.cos(rads);
	
	gl.clear( gl.COLOR_BUFFER_BIT);
	
	var mvMatrix = lookAt(eye,at,up);
	gl.uniformMatrix4fv(gl.getUniformLocation(program,"modelView"),false,flatten(mvMatrix));	
	
	var pMatrix = perspective(fov,aspect,near,far);
	gl.uniformMatrix4fv(gl.getUniformLocation(program,"projection"),false,flatten(pMatrix));
	
	    normalMatrix = [
        vec3(mvMatrix[0][0], mvMatrix[0][1], mvMatrix[0][2]),
        vec3(mvMatrix[1][0], mvMatrix[1][1], mvMatrix[1][2]),
        vec3(mvMatrix[2][0], mvMatrix[2][1], mvMatrix[2][2])
    ];
	
	
    gl.uniformMatrix3fv(gl.getUniformLocation(program,"normalMatrix"), false, flatten(normalMatrix) );

	
	gl.drawArrays(gl.TRIANGLES,0,index);
	
	requestAnimFrame(render);
}