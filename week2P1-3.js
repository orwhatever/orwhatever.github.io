var gl;
//var points;
var index = 0;
var triangleIndex = 0;
var pointIndex = 0;

var canvas;
var triangleMode = 0;
var colorVector = vec3(0.0, 0.0, 0.0);


window.onload = function init() {
	canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext("webgl");
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
	
	// Load shaders and initialize attribute buffers
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	
	// Write to GPU with pos
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, 20000, gl.STATIC_DRAW);
	
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	
	
	// Write to GPU with color
	var cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, 20000, gl.STATIC_DRAW);
	
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
	
	var triangles = [];
	var points = [];
	var pcolors = [];
	var tcolors = [];
	var count = 0;
	
	var indices = [];
	var colorindices = [];
	
	canvas.addEventListener("click", function(event) {
		
		var t = vec2(-1 + 2*(event.clientX-7)/canvas.width,
		-1 + 2*(canvas.height-(event.clientY-7))/canvas.height);
		
		
		if(triangleMode == 1){
			points.push(t); 
			pcolors.push( colorVector);
			count++;
			if(count == 3){
			count = 0; 
			triangles.push(points.pop()); 
			triangles.push(points.pop());
			triangles.push(points.pop());
			
			tcolors.push(pcolors.pop());
			tcolors.push(pcolors.pop());
			tcolors.push(pcolors.pop());
			pointIndex -=3;
			triangleIndex +=3;
			}
			
		}else{
			count = 0;
			points.push(t); 
			pcolors.push( colorVector);
		}
		
		
		
		
		//colors.push( new vec3(colorVector.x , colorVector.y ,colorVector.z));
		
		
		indices =  points.concat(triangles) ;
		colorindices = pcolors.concat(tcolors);
		
				
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(indices) , gl.STATIC_DRAW);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(colorindices) , gl.STATIC_DRAW );
		
		
		pointIndex++;
		index++;

	});
	
		
	
	var clearButton = document.getElementById("Clear");
	clearButton.addEventListener("click", function() { 
		index = 0;
		gl.clearColor(colorVector[0], colorVector[1], colorVector[2], 1.0);
	});
	
	
	var pointButton = document.getElementById("Point");
		pointButton.addEventListener("click", function() { 
		triangleMode = 0;
	});
	
	var triangleButton = document.getElementById("Triangle");
		triangleButton.addEventListener("click", function() { 
		triangleMode = 1;
	});
	
	
	var m = document.getElementById("Colormenu");
	m.addEventListener("click", function() {
	//gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		switch (m.selectedIndex) {
		case 0:
		colorVector = vec3(0.3921, 0.5843, 0.9294);
		break;
		case 1:
		colorVector = vec3(1.0, 0.0, 0.0);
		break;
		case 2:
		colorVector = vec3(0.0, 1.0, 0.0);
		break;
		}
	//gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec3']*index, flatten(colorVector));
	});
	
	render();
	
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.drawArrays(gl.POINTS, 0, pointIndex);
	gl.drawArrays(gl.TRIANGLES, pointIndex, triangleIndex);
	
	window.requestAnimFrame(render, canvas);
}