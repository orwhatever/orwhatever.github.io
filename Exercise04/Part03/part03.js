var canvas;
var gl;
var program;

var pointsArray = [];
var normalsArray = [];

var near = 0.3;
var far = 10.0;
var radius = 8.0;
var theta = 0.0;
var phi = 0.0;

var fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var aspect = 1.0;       // Viewport aspect ratio

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;

var vertexA = vec4(0.0, 0.0, -1.0, 1);
var vertexB = vec4(0.0, 0.942809, 0.333333, 1);
var vertexC = vec4(-0.816497, -0.471405, 0.333333, 1);
var vertexD = vec4(0.816497, -0.471405, 0.333333, 1);
var numTimesToSubdivide = 0;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var lightPosition = vec4(0, 0, -1.0, 0);
var lightPositionLoc;

function triangle(a, b, c) {
    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);

    // The normal is the position vertex, since we are on a unit sphere.
    // In homogeneous coordinates setting 4th element to zero since, the normal
    // is a vector
    var normalA = vec4(a[0], a[1], a[2], 0.0);
    var normalB = vec4(b[0], b[1], b[2], 0.0);
    var normalC = vec4(c[0], c[1], c[2], 0.0);

    normalsArray.push(normalA);
    normalsArray.push(normalB);
    normalsArray.push(normalC);
}


function divideTriangle(a, b, c, count) {
    if (count > 0) {

        var ab = normalize(mix(a, b, 0.5), true);
        var ac = normalize(mix(a, c, 0.5), true);
        var bc = normalize(mix(b, c, 0.5), true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }
    else { // draw tetrahedron at end of recursion
        triangle(a, b, c);
    }
}

function tetrahedron(a, b, c, d, n) {
    pointsArray = [];
    normalsArray = [];

    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}


window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas, null);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    aspect = canvas.width / canvas.height;

    tetrahedron(vertexA, vertexB, vertexC, vertexD, numTimesToSubdivide);

    document.getElementById("increaseSubsBtn").onclick = function () {
        numTimesToSubdivide++;
        tetrahedron(vertexA, vertexB, vertexC, vertexD, numTimesToSubdivide);
    };
    document.getElementById("decreaseSubsBtn").onclick = function () {
        numTimesToSubdivide = numTimesToSubdivide > 0 ? numTimesToSubdivide - 1 : 0;
        tetrahedron(vertexA, vertexB, vertexC, vertexD, numTimesToSubdivide);
    };

    render();
};


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta), 1);

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);

    theta = (theta + Math.PI * 1.0 / 180.0) % 360.0;

    window.requestAnimFrame(render);
}