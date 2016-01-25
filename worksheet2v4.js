
var canvas;
var gl;

var numPoints = 3;
var numTriangles = 0;
var numCircles = 0;

var vertices =
[	vec4(0,0,0,1),
	vec4(1,1,0,1),
	vec4(1,0,0,1),
];

var triangles = [];
var triangleColors = [];
var circles = [];
var circleColors = [];

var colors =
[	vec4(1,0,0,1),
	vec4(0,0,1,1),
	vec4(0,1,0,1),
];

var numDivs = 30;

function circle(center, radius, col1, col2)
{
	circles.push(center);
	circleColors.push(col1);
	for(var i = 0; i <= numDivs; i++)
	{
		var theta = (2*Math.PI/numDivs)*i;
		circles.push(vec4(	center[0]+radius*Math.cos(theta),
							center[1]+radius*Math.sin(theta),
							0, 1));
		circleColors.push(col2);
	}
}

var colorSelect = [

    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0)   // cyan
];

var vPosition;
var cPosition;

var mode = 0;

var curPoints = 0;

var vBuffer;
var cBuffer;

var cindex = 0;

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
	
    var m = document.getElementById("mymenu");

    m.addEventListener("click", function() {
       cindex = m.selectedIndex;
        });
	
    var a = document.getElementById("Button1")
    a.addEventListener("click", function(){
		numPoints = 0;
		vertices = [];
		colors = [];
		gl.clearColor(colorSelect[cindex][0],colorSelect[cindex][1],colorSelect[cindex][2],colorSelect[cindex][3]);
	    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
		gl.clear(gl.COLOR_BUFFER_BIT);
    });

	var b = document.getElementById("Button2")
	b.addEventListener("click",function(){
		mode = 1;
	});
	
	var c = document.getElementById("Button3")
	c.addEventListener("click",function(){
		mode = 0;
	});	

	var d = document.getElementById("Button4")
	d.addEventListener("click",function(){
		mode = 2;
	});	
	
	
	canvas.addEventListener("mousedown", function(){
		var x = event.clientX - event.target.getBoundingClientRect().left;
		var y = canvas.height - (event.clientY - event.target.getBoundingClientRect().top);
		x = (x-canvas.width/2)/(canvas.width/2);
		y = (y-canvas.height/2) / (canvas.height/2);
		vertices.push(vec4(x,y,0,1));
		colors.push(colorSelect[cindex]);
		numPoints++;
		if(mode == 1)
		{
			curPoints++;
			if(curPoints == 3)
			{
				triangles.push(vertices.pop());
				triangles.push(vertices.pop());
				triangles.push(vertices.pop());
				triangleColors.push(colors.pop());
				triangleColors.push(colors.pop());
				triangleColors.push(colors.pop());
				numPoints -= 3;
				numTriangles++;
				curPoints = 0;
			}
		}
		if(mode == 2)
		{
			curPoints++;
			if(curPoints == 2)
			{
				var p2 = vertices.pop();
				var p1 = vertices.pop();
				var c2 = colors.pop();
				var c1 = colors.pop();
				var r = length(subtract(p1,p2));
				numPoints -= 2;
				numCircles++;
				circle(p1,r,c1,c2);
				curPoints = 0;
			}
		}
	    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices.concat(triangles.concat(circles))), gl.STATIC_DRAW );
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(colors.concat(triangleColors.concat(circleColors))), gl.STATIC_DRAW);
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
		
	gl.drawArrays(gl.POINTS,0,numPoints);
	
	gl.drawArrays(gl.TRIANGLES, numPoints, numTriangles*3);
	for(var i = 0; i < numCircles; i++)
		gl.drawArrays(gl.TRIANGLE_FAN, numPoints + numTriangles*3 + (numDivs + 2) * i, (numDivs + 2));
	
	requestAnimFrame(render);
}