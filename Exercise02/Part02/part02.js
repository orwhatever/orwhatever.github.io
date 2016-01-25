/**
 * Created by jga on 9/16/15.
 */
"use strict";
var POINT_DRAWING = 0;
var TRIANGLE_DRAWING = 1;
var CIRCLE_DRAWING = 2;

var MAX_NUM_VERTICES = 1000;
var CIRCULAR_FAN_NUM_VERTICES = 50;

var gl;

var vertexIndex = 0;
var colors;
var selectedColor;
var drawingMode;
var triVertices = [];
var pointVertices = [];
var circleVertices = [];
var mod2counter = 0;
var mod3counter = 0;

var circleCenter;
var circleCenterColor;
var circlePoints = [];
var circlePointColors = [];

window.onload = function init() {

    var canvas = document.getElementById("gl-canvas");
    var clearButton = document.getElementById("clearButton");
    var drawPointsButton = document.getElementById("drawPointsButton");
    var drawTrianglesButton = document.getElementById("drawTrianglesButton");
    var drawCirclesButton = document.getElementById("drawCirclesButton");
    var colorMenu = document.getElementById("colorMenu");

    colors = [
        vec3(0.3921, 0.5843, 0.9294),
        vec3(0 / 255, 0 / 255, 0 / 255),
        vec3(255 / 255, 255 / 255, 255 / 255),
        vec3(255 / 255, 0 / 255, 0 / 255),
        vec3(0 / 255, 255 / 255, 0 / 255),
        vec3(0 / 255, 0 / 255, 255 / 255),
        vec3(255 / 255, 255 / 255, 0 / 255),
        vec3(0 / 255, 255 / 255, 255 / 255),
        vec3(255 / 255, 0 / 255, 255 / 255),
        vec3(192 / 255, 192 / 255, 192 / 255),
        vec3(128 / 255, 128 / 255, 128 / 255),
        vec3(128 / 255, 0 / 255, 0 / 255),
        vec3(128 / 255, 128 / 255, 0 / 255),
        vec3(0 / 255, 128 / 255, 0 / 255),
        vec3(128 / 255, 0 / 255, 128 / 255),
        vec3(0 / 255, 128 / 255, 128 / 255),
        vec3(0 / 255, 0 / 255, 128 / 255)
    ];

    selectedColor = colors[1];

    drawPointsButton.disabled = true;
    drawingMode = POINT_DRAWING;

    gl = WebGLUtils.setupWebGL(canvas, null);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * MAX_NUM_VERTICES, gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizeof['vec2'] * MAX_NUM_VERTICES, gl.STATIC_DRAW)

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    canvas.addEventListener("click", function (event) {
        var x, y;
        if (event.x != undefined && event.y != undefined) {
            x = event.x;
            y = event.y;
        }
        else // Firefox method to get the position
        {
            x = event.clientX + document.body.scrollLeft +
                document.documentElement.scrollLeft;
            y = event.clientY + document.body.scrollTop +
                document.documentElement.scrollTop;
        }

        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;


        var mousePosition = vec2(2 * x / canvas.width - 1,
            2 * (canvas.height - y) / canvas.height - 1);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2'] * vertexIndex, flatten(mousePosition));

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec3'] * vertexIndex, flatten(selectedColor));

        switch (drawingMode) {
            case POINT_DRAWING:
                pointVertices.push(vertexIndex);
                vertexIndex++;
                break;
            case TRIANGLE_DRAWING:
                if (mod3counter < 2) {
                    pointVertices.push(vertexIndex)
                } else {
                    pointVertices.pop();
                    pointVertices.pop();
                    triVertices.push(vertexIndex);
                }
                vertexIndex++;
                mod3counter = (mod3counter + 1) % 3
                break;
            case CIRCLE_DRAWING:
                if (mod2counter < 1) {
                    circleCenter = mousePosition;
                    circleCenterColor = vec3(selectedColor);
                    pointVertices.push(vertexIndex);
                    vertexIndex++;
                } else {
                    var radius = length(subtract(mousePosition, circleCenter));
                    pointVertices.pop();
                    vertexIndex--;
                    var previousVertexIndex = vertexIndex;

                    var NumPeripheralPoints = CIRCULAR_FAN_NUM_VERTICES - 1;
                    var step = 2 * Math.PI / (NumPeripheralPoints - 1);

                    circlePoints = [];
                    circlePointColors = [];

                    circlePoints.push(circleCenter);
                    circlePointColors.push(circleCenterColor);
                    vertexIndex++;

                    for (var i = 1; i < CIRCULAR_FAN_NUM_VERTICES; ++i) {
                        var theta = i * step;
                        circlePointColors.push(selectedColor);
                        circlePoints.push(vec2(circleCenter[0] + radius * Math.cos(theta), circleCenter[1] + radius * Math.sin(theta)));
                        vertexIndex++;
                    }

                    circleVertices.push(vertexIndex - 1);

                    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2'] * previousVertexIndex, flatten(circlePoints));

                    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                    gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec3'] * previousVertexIndex, flatten(circlePointColors));


                }
                mod2counter = (mod2counter + 1) % 2
                break;
        }


        render();

    });

    clearButton.addEventListener("click", function (event) {
        vertexIndex = 0;
        triVertices = [];
        pointVertices = [];
        circleVertices = [];
        mod2counter = 0;
        mod3counter = 0;
        gl.clearColor(selectedColor[0], selectedColor[1], selectedColor[2], 1.0);
        render();
    });

    drawPointsButton.addEventListener("click", function (event) {
        drawPointsButton.disabled = true;
        drawTrianglesButton.disabled = false;
        drawCirclesButton.disabled = false;
        drawingMode = POINT_DRAWING;
        while (mod3counter > 0) {
            pointVertices.pop();
            vertexIndex--;
            mod3counter--;
        }
        while (mod2counter > 0) {
            pointVertices.pop();
            vertexIndex--;
            mod2counter--;
        }
        render();
    });

    drawTrianglesButton.addEventListener("click", function (event) {
        drawPointsButton.disabled = false;
        drawTrianglesButton.disabled = true;
        drawCirclesButton.disabled = false;
        drawingMode = TRIANGLE_DRAWING;
        mod3counter = 0;
    });

    drawCirclesButton.addEventListener("click", function (event) {
        drawPointsButton.disabled = false;
        drawTrianglesButton.disabled = false;
        drawCirclesButton.disabled = true;
        drawingMode = CIRCLE_DRAWING;
        mod2counter = 0;
    });

    $('.selectpicker').on('change', function (event) {
        selectedColor = colors[colorMenu.selectedIndex];
    });

    gl.clear(gl.COLOR_BUFFER_BIT);
}


function render() {

    gl.clear(gl.COLOR_BUFFER_BIT);

    var kPoint = 0;
    var kTri = 0;
    var kCircle = 0;

    var n = 0;
    var start = 0;
    var pivot = start + n - 1;

    var vertexRendered = 0;
    while (vertexRendered < vertexIndex) {
        while (kPoint < pointVertices.length && pivot + 1 == pointVertices[kPoint]) {
            n += 1;
            pivot += 1;
            kPoint += 1;
        }
        if (n > 0) {
            gl.drawArrays(gl.POINTS, start, n);
            pivot = start + n - 1;
            start += n;
            vertexRendered += n;
            n = 0;
        }
        while (kTri < triVertices.length && pivot + 3 == triVertices[kTri]) {
            n += 3;
            pivot += 3;
            kTri += 1;
        }
        if (n > 0) {
            gl.drawArrays(gl.TRIANGLES, start, n);
            pivot = start + n - 1;
            start += n;
            vertexRendered += n;
            n = 0;
        }
        while (kCircle < circleVertices.length && pivot + CIRCULAR_FAN_NUM_VERTICES == circleVertices[kCircle]) {
            n += CIRCULAR_FAN_NUM_VERTICES;
            gl.drawArrays(gl.TRIANGLE_FAN, pivot + 1, CIRCULAR_FAN_NUM_VERTICES);
            pivot += CIRCULAR_FAN_NUM_VERTICES;
            kCircle += 1
        }
        if (n > 0) {
            pivot = start + n - 1;
            start += n;
            vertexRendered += n;
            n = 0;
        }
    }
}