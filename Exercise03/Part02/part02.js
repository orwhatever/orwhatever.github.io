"use strict";

var program;
var canvas;
var gl;

var NumVertices = 36;

var pointsArray = [];
var colorsArray = [];

var vertices = [
    vec4(0.0, 0.0, 1.0), // L-D-F
    vec4(0.0, 1.0, 1.0), // L-U-F
    vec4(1.0, 1.0, 1.0), // R-U-F
    vec4(1.0, 0.0, 1.0), // R-D-F
    vec4(0.0, 0.0, 0.0), // L-D-B
    vec4(0.0, 1.0, 0.0), // L-U-B
    vec4(1.0, 1.0, 0.0), // R-U-B
    vec4(1.0, 0.0, 0.0)  // R-D-B
];

var vertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(1.0, 1.0, 1.0, 1.0),  // white
];


var near;
var far;
var radius;
var theta;
var phi;

var fovy;  // Field-of-view in Y direction angle (in degrees)
var aspect;       // Viewport aspect ratio

var modelViewMatrix, projectionMatrix, ctm;
var ctmLoc;
var eye;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

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

function createColorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
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

    near = 0.3;
    far = 10.0;
    radius = 6.0;
    theta = 1 / Math.sqrt(2);
    phi = Math.PI / 4;
    aspect = canvas.width / canvas.height;
    fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)


    createColorCube();

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    render()
};


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta = Math.PI / 4;
    phi = Math.PI / 4;
    eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    ctm = mult(projectionMatrix, modelViewMatrix);

    ctmLoc = gl.getUniformLocation(program, "ctm");
    gl.uniformMatrix4fv(ctmLoc, false, flatten(ctm));

    for (var i = 0; i < NumVertices; i += 3) {
        gl.drawArrays(gl.TRIANGLES, i, 3);
    }

    theta = Math.PI / 4;
    phi = 0.0;
    eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    ctm = mult(projectionMatrix, modelViewMatrix);

    ctmLoc = gl.getUniformLocation(program, "ctm");
    gl.uniformMatrix4fv(ctmLoc, false, flatten(ctm));

    for (var i = 0; i < NumVertices; i += 3) {
        gl.drawArrays(gl.TRIANGLES, i, 3);
    }

    theta = 0.0;
    phi = 0.0;
    eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    ctm = mult(projectionMatrix, modelViewMatrix);

    ctmLoc = gl.getUniformLocation(program, "ctm");
    gl.uniformMatrix4fv(ctmLoc, false, flatten(ctm));

    for (var i = 0; i < NumVertices; i += 3) {
        gl.drawArrays(gl.TRIANGLES, i, 3);
    }

    gl.drawArrays(gl.TRIANGLES, 0, NumVertices);
}