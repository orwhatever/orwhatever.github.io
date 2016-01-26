// Global vars
var gl;
var canvas;
var triangleIndex = 0;
var pointIndex = 0;
var triangleMode = 0;
var polyMode = 0;
var count = 0;
var triangles = [];
var polygons = [];
var polyColors = [];
var points = [];
var pcolors = [];
var tcolors = [];
var indices = [];
var colorindices = [];
var colorVector = vec3(0.0, 0.0, 0.0);

// Main function
window.onload = function init() {
	// Set up GL
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
	gl.bufferData(gl.ARRAY_BUFFER, 200000, gl.STATIC_DRAW);
	
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	
	// Write to GPU with color
	var cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, 200000, gl.STATIC_DRAW);
	
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
	
	// User clicked on canvas function
	canvas.addEventListener("click", function(event) {
		
		// Get mouse pos at middle of object
		var t = vec2(-1+2*(event.clientX-7)/canvas.width,
		-1+2*(canvas.height-(event.clientY-7))/canvas.height);
		
		if(polyMode == 1) { // Poly mode
			points.push(t); 
			pcolors.push(colorVector);
			count++;
		} else if(triangleMode == 1) { // Triangle mode 
			points.push(t); 
			pcolors.push(colorVector);
			count++;
			if(count == 3) { // Make triangle and remove the used points
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
		} else { // Point mode
			count = 0;
			points.push(t);
			pcolors.push(colorVector);
		}
		
		// Buffer points and triangles
		indices = points.concat(triangles);
		colorindices = pcolors.concat(tcolors);
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(indices), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(colorindices), gl.STATIC_DRAW );
		pointIndex++;
		
	});
	
	// Clear screen and reset vars acordingly
	var clearButton = document.getElementById("Clear");
	clearButton.addEventListener("click", function() { 
		gl.clearColor(colorVector[0], colorVector[1], colorVector[2], 1.0);
		count = 0;
		polyMode = 0;
		triangleMode = 0;
		triangleIndex = 0;
		pointIndex = 0;
		polygons = [];
		polyColors = [];
		triangles = [];
		points = [];
		colorindices = [];
		tcolors = [];
		pcolors = [];
	});
	
	// Polygon mode start
	var polyStartButton = document.getElementById("Polygon start");
	polyStartButton.addEventListener("click", function() {
		polyMode = 1;
		triangleMode = 0;
	});
	
	// Polygon mode end
	var polyEndButton = document.getElementById("Polygon end");
	polyEndButton.addEventListener("click", function() {
		if(count > 2) {
			for(var i = 0; i < count; i++) { // Make array for poly calc
				polygons.push(points.pop());
				polyColors.push(pcolors.pop());
			}
			polygon(polygons, polyColors); // Call polygon function
			// Reset vars
			polygons = [];
			polyColors = [];
			pointIndex -= count;
			triangleIndex += 3*(count-2);
			polyMode = 0;
			count = 0;
			
			// Buffer points and triangles
			indices = points.concat(triangles);
			colorindices = pcolors.concat(tcolors);
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, flatten(indices), gl.STATIC_DRAW);
			gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, flatten(colorindices), gl.STATIC_DRAW );
		} else {
			if(polyMode == 0) 
				alert("Please start polygon mode")
			else
				alert("Please make atleast 3 points");
		}
	});
	
	// Point mode
	var pointButton = document.getElementById("Point");
	pointButton.addEventListener("click", function() {
		if(polyMode == 0) {
			triangleMode = 0;
		} else {
			alert("Please end polygon mode");
		}
	});
	
	// Triangle mode
	var triangleButton = document.getElementById("Triangle");
	triangleButton.addEventListener("click", function() {
		if(polyMode == 0) {
			triangleMode = 1;
		} else {
			alert("Please end polygon mode");
		}
	});
	
	// Color menu
	var m = document.getElementById("Colormenu");
	m.addEventListener("click", function() {
		switch (m.selectedIndex) {
		case 0: // Blue
			colorVector = vec3(0.3921, 0.5843, 0.9294);
			break;
		case 1: // Red
			colorVector = vec3(1.0, 0.0, 0.0);
			break;
		case 2:	// Green
			colorVector = vec3(0.0, 1.0, 0.0);
			break;
		case 3:
			colorVector = vec3(1.0, 1.0, 1.0);
			break;
		case 4:
			colorVector = vec3(0.0, 0.0, 0.0);
			break;
		}
	});
	
	// Call render function
	render();
}

// Polygon function
function polygon(curPoints, curColors) {
	
	// Find if clockwise or counterclockwise
	var i, j, sum = 0, len = curPoints.length, clockwise;
	for (i = 0, j = len - 1; i < len; j = i++) {
        sum += (curPoints[i][0] - curPoints[j][0]) * (curPoints[i][1] + curPoints[j][1]);
    }
    clockwise = sum < 0;
	
	// Find Ears and calc triangles
	var prev, cur, next,
		prevx, prevy, curx, cury, nextx, nexty,
		d1, d2, d3, A,
		signVar, npy, pnx, pcy, cpx, check_point, check_pointx, check_pointy, s, t;
	while(len >= 3) {
		// Add last triangle
		if(len == 3) {
			triangles.push(curPoints.pop());
			triangles.push(curPoints.pop());
			triangles.push(curPoints.pop());
			tcolors.push(curColors.pop());
			tcolors.push(curColors.pop());
			tcolors.push(curColors.pop());
			break; // We have found all triangles
		}
		
		// Go through points
		for(var k = 0; k < len; k++) {
			// Init prev, cur and next point (DLL)
			if(k == 0) {
				prev = curPoints[len-1];
				cur = curPoints[k];
				next = curPoints[k+1];
			} else if(k == len-1) {
				prev = curPoints[k-1];
				cur = curPoints[k];
				next = curPoints[0];
			} else {
				prev = curPoints[k-1];
				cur = curPoints[k];
				next = curPoints[k+1];
			}
			
			// Area
			prevx = prev[0]; prevy = prev[1];
			curx = cur[0]; cury = cur[1];
			nextx = next[0]; nexty = next[1];
			d1 = prevx * cury - prevy * curx;
			d2 = prevx * nexty - prevy * nextx;
			d3 = nextx * cury - nexty * curx;
			A = d1 - d2 - d3;
			if((A > 0) != clockwise) continue; // Reflex
			
			// The current point is Convex
			if(clockwise) signVar = 1; else signVar = -1;
			npy = nexty - prevy;
			pnx = prevx - nextx;
			pcy = prevy - cury;
			cpx = curx - prevx;
			
			//Check for points inside triangle
			var isEar = true; // Asmuse Ear until proven innocent
			for(var j = 0; j < len; j++) {
				check_point = curPoints[j];
				if((check_point == prev) || (check_point == cur) || (check_point == next)) { 
					continue; // Skip triangle's own points
				}
				check_pointx = check_point[0];
				check_pointy = check_point[1];
				
				s = (npy * check_pointx + pnx * check_pointy - d2) * signVar;
				t = (pcy * check_pointx + cpx * check_pointy + d1) * signVar;
				
				if(s >= 0 && t >= 0 && (s + t) <= A * signVar) { // A point was found
					isEar = false; 
					break;
				}
			}
			
			if(isEar) { // This is an Ear
				// Find colors to push
				var prevc, curc, nextc;
				if(k == 0) {
					prevc = curColors[len-1];
					curc = curColors[k];
					nextc = curColors[k+1];
				} else if(k == len-1) {
					prevc = curColors[k-1];
					curc = curColors[k];
					nextc = curColors[0];
				} else {
					prevc = curColors[k-1];
					curc = curColors[k];
					nextc = curColors[k+1];
				}
				// Push triangle and color
				triangles.push(prev);
				triangles.push(cur);
				triangles.push(next);
				curPoints.splice(k,1);
				tcolors.push(prevc);
				tcolors.push(curc);
				tcolors.push(nextc);
				curColors.splice(k,1);
				len--;
			}
		}
	}
}

// Render function
function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	// Draw Points
	gl.drawArrays(gl.POINTS, 0, pointIndex);
	
	// Draw Triangles
	gl.drawArrays(gl.TRIANGLES, pointIndex, triangleIndex);
	
	window.requestAnimFrame(render, canvas);
}