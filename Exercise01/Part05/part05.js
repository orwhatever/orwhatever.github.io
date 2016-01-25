/**
 * Created by jga on 9/16/15.
 */
"use strict";

var gl;
var points = [];
var NumPoints = 100;
var thetaLoc;
var theta = 0.0;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas, null);
    if (!gl) {
        alert("WebGL isn't available");
    }


    var step = 2 * Math.PI / NumPoints;

    for (var i = 0; i <= NumPoints; ++i) {
        var theta = i * step;
        points.push(vec2(0.3*Math.cos(theta), 0.3*Math.sin(theta)));
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta");

    render();

}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    theta += 0.01;
    gl.uniform1f(thetaLoc, theta);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length);
    requestAnimFrame(render);
}