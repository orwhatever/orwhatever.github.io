
var canvas;
var gl;

var numPoints = 3;

var vertices =
[	vec4(0,0,0,1),
	vec4(1,1,0,1),
	vec4(1,0,0,1),
];

var colors =
[	vec4(1,0,0,1),
	vec4(0,0,1,1),
	vec4(0,1,0,1),
];

var vPosition;
var cPosition;

var vBuffer;
var cBuffer;

window.onload = function()
{
	canvas=document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
	
	
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
	
	cPosition = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer( cPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(cPosition);
	
	canvas.addEventListener("mousedown", function(){
		
		var x = event.clientX - event.target.getBoundingClientRect().left;
		var y = canvas.height - (event.clientY - event.target.getBoundingClientRect().top);
		console.log();
		x = (x-canvas.width/2)/(canvas.width/2);
		y = (y-canvas.height/2) / (canvas.height/2);

		
		vertices.push(vec4(x,y,0,1));
		colors.push(vec4(0,0,0,1));
		numPoints++;
		
	    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
		
	});
	
	
	render();
}

var rads = 0;

var render = function()
{
	gl.clear( gl.COLOR_BUFFER_BIT);
	
	rads += 0.05;
	if(rads > 2*Math.PI) rads -= 2*Math.PI;
	
	var rotationMatrix = rotateZ(rads);
	
	
	gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER,flatten(vertices),gl.STATIC_DRAW);
	gl.vertexAttribPointer(vPosition,4,gl.FLOAT,false,0,0);
	gl.enableVertexAttribArray(vPosition);
	
	
	gl.drawArrays(gl.POINTS,0,numPoints);
	requestAnimFrame(render);
}