"use strict";

var canvas;
var gl;

var numVertices = 36;

var indices = [];

var vertices = [
    vec3(-1.0, -1.0, 1.0), // L-D-F
    vec3(-1.0, 1.0, 1.0), // L-U-F
    vec3(1.0, 1.0, 1.0), // R-U-F
    vec3(1.0, -1.0, 1.0), // R-D-F
    vec3(-1.0, -1.0, -1.0), // L-D-B
    vec3(-1.0, 1.0, -1.0), // L-U-B
    vec3(1.0, 1.0, -1.0), // R-U-B
    vec3(1.0, -1.0, -1.0)  // R-D-B
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

    indices.push(a);
    indices.push(b);
    indices.push(c);

    indices.push(a);
    indices.push(c);
    indices.push(d);

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

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    near = 0.3;
    far = 10.0;
    radius = 6.0;
    theta = 1 / Math.sqrt(2);
    phi = Math.PI / 4;
    aspect = canvas.width / canvas.height;
    fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)

    eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta));

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    ctm = mult(projectionMatrix, modelViewMatrix);


    createColorCube();

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    ctmLoc = gl.getUniformLocation(program, "ctm");
    gl.uniformMatrix4fv(ctmLoc, false, flatten(ctm));

    render()
};


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawElements( gl.TRIANGLES, numVertices, gl.UNSIGNED_SHORT, 0 );
}