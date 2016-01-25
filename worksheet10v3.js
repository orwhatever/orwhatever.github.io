
var canvas;
var gl;

var pointsArray = [];
var normalsArray = [];
var index = 0;

var mvMatrix;
var pMatrix;

var eye = vec3(0,0,-1);
var at = vec3(0,0,0);
var up = vec3(0,1,0);

var left = -1;
var right = 1;
var ytop = 1;
var bot = -1;
var front = 0;
var back = 5;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var subdivs = 4;
var mTexLoc = null;
var mvloc;
var ploc;
var mirrorloc;
var eyeloc;

var cubemap;

var cubemapLocs = [	"cm_left.png",
				"cm_right.png",
				"cm_top.png",
				"cm_bottom.png",
				"cm_back.png",
				"cm_front.png"];
				
var cubemapSides = [];

function triangle(a, b, c) {



     pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);

     // normals are vectors

     normalsArray.push(a[0],a[1], a[2]);
     normalsArray.push(b[0],b[1], b[2]);
     normalsArray.push(c[0],c[1], c[2]);

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
				
window.onload = function()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	
    gl.enable(gl.DEPTH_TEST);
	
	tetrahedron(va,vb,vc,vd, subdivs);
	
	var z = 0.999;
	
	
	pointsArray.push(vec4(-1.0,-1.0,z,1.0),vec4(1.0,-1.0,z,1.0),vec4(1.0,1.0,z,1.0),vec4(-1.0,1.0,z,1.0));
	normalsArray.push(0,0,1);
	normalsArray.push(0,0,1);
	normalsArray.push(0,0,1);
	normalsArray.push(0,0,1);
	
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram(program);
	
	var pointBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, pointBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
	
	var vPos = gl.getAttribLocation(program,"vPosition");
	gl.vertexAttribPointer(vPos,4,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(vPos);
	
	var normalBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
	
	var vNorm = gl.getAttribLocation(program,"vNormal");
	gl.vertexAttribPointer(vNorm,3,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(vNorm);
	
	mTexLoc = gl.getUniformLocation(program,"mTex");
	mvloc = gl.getUniformLocation(program,"modelView");
	ploc = gl.getUniformLocation(program,"projection");
	eyeloc = gl.getUniformLocation(program,"eye");
	mirrorloc = gl.getUniformLocation(program,"mirror");
	
	cubemap = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.uniform1i(gl.getUniformLocation(program,"texMap"),0);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP,cubemap);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	
	cubemapSides.push(gl.TEXTURE_CUBE_MAP_POSITIVE_X);
	cubemapSides.push(gl.TEXTURE_CUBE_MAP_NEGATIVE_X);
	cubemapSides.push(gl.TEXTURE_CUBE_MAP_POSITIVE_Y);
	cubemapSides.push(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y);
	cubemapSides.push(gl.TEXTURE_CUBE_MAP_POSITIVE_Z);
	cubemapSides.push(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z);
	
    gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
	
	var img = document.createElement('img');
	img.crossOrigin = 'anonymous';
	img.onload = function()
	{
		var normalMap = gl.createTexture();
		gl.activeTexture(gl.TEXTURE1);
		gl.uniform1i(gl.getUniformLocation(program,"normalMap"),1);
		gl.bindTexture(gl.TEXTURE_2D,normalMap);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP,cubemap);
		loadImage(0);
	}
	img.src = "normalmap.png";
	
	
	

	
}

var loadImage = function(index)
{
	var img = document.createElement('img')
	img.crossOrigin = 'anonymous';
	img.onload = function() {
		gl.texImage2D(cubemapSides[index], 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
		index = index + 1;
		if(index < cubemapLocs.length) loadImage(index);
		else render();
	}
	img.src = cubemapLocs[index];
}

var rads = 0;

var render = function()
{
	//rads += 0.05;
	//if(rads > 2*Math.PI) rads -= 2*Math.PI;
	
	//eye[0] = Math.sin(rads);
	//eye[2] = -Math.cos(rads);
	
	var mTex = mat4();
	
	gl.uniformMatrix4fv(mTexLoc,false,flatten(mTex));
	mvMatrix = lookAt(eye,at,up);
	pMatrix = ortho(left,right,bot,ytop,front,back);
	
	//mvMatrix = mat4();
	//pMatrix = mat4();
	
	gl.uniformMatrix4fv(mvloc,false,flatten(mvMatrix));
	gl.uniformMatrix4fv(ploc,false,flatten(pMatrix));
	gl.uniform3fv(eyeloc,flatten(eye));
	
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.uniform1i(mirrorloc,1);
	gl.drawArrays(gl.TRIANGLES, 0, index);
	
	var normalMatrix = mvMatrix;
	
	normalMatrix[3][0] = 0;
	normalMatrix[3][1] = 0;
	normalMatrix[3][2] = 0;
	normalMatrix[3][3] = 1;
	normalMatrix[0][3] = 0;
	normalMatrix[1][3] = 0;
	normalMatrix[2][3] = 0;
		
	//mTex = mult(inverse(normalMatrix),inverse(pMatrix));
	
	gl.uniformMatrix4fv(mTexLoc,false,flatten(mTex));
	
	gl.uniform1i(mirrorloc,0);
	gl.drawArrays(gl.TRIANGLE_FAN,index,4);
	
	window.requestAnimFrame(render);
}