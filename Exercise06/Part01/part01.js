var canvas;
var gl;
var program;

var pointsArray = [];
var texCoordsArray = [];
var texture;

var near = 0.3;
var far = 20.0;
var radius = 8.0;
var theta = 0.0;
var phi = 0.0;

var fovy = 90.0;  // Field-of-view in Y direction angle (in degrees)
var aspect = 1.0;       // Viewport aspect ratio

var projectionMatrix;
var projectionMatrixLoc;
var eye;

var vertexA = vec4(-4, -1, -1, 1);
var vertexB = vec4(4, -1, -1, 1);
var vertexC = vec4(4, -1, -21, 1);
var vertexD = vec4(-4, -1, -21, 1);

var texCoordA = vec2(-1.5, 0.0);
var texCoordB = vec2(2.5, 0.0);
var texCoordC = vec2(2.5, 10.0);
var texCoordD = vec2(-1.5, 10.0);

var textureSize = 64;
var chessboardSize = 8;
var chessboard = new Uint8Array(4 * textureSize * textureSize);
for (var i = 0; i < textureSize; i++) {
    var c = 0;
    for (var j = 0; j < textureSize; j++) {
        var patchX = Math.floor(i / (textureSize / chessboardSize));
        var patchY = Math.floor(j / (textureSize / chessboardSize));
        c = (patchX % 2 ^ patchY % 2) ? 255 : 0;
        chessboard[4 * i * textureSize + 4 * j] = c;
        chessboard[4 * i * textureSize + 4 * j + 1] = c;
        chessboard[4 * i * textureSize + 4 * j + 2] = c;
        chessboard[4 * i * textureSize + 4 * j + 3] = 255;
    }
}

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

function triangle(a, b, c) {
    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);
}

function triangleTexCoord(a, b, c) {
    texCoordsArray.push(a);
    texCoordsArray.push(b);
    texCoordsArray.push(c);
}

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    var repeatButton = document.getElementById("repeatButton");
    var clampToEdgeButton = document.getElementById("clampToEdgeButton");
    var filteringModeMenu = document.getElementById("filteringModeMenu");

    repeatButton.disabled = true;

    gl = WebGLUtils.setupWebGL(canvas, null);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    aspect = canvas.width / canvas.height;

    triangle(vertexC, vertexD, vertexA);
    triangle(vertexA, vertexB, vertexC);

    triangleTexCoord(texCoordC, texCoordD, texCoordA);
    triangleTexCoord(texCoordA, texCoordB, texCoordC);

    eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi), radius * Math.cos(theta), 1);
    projectionMatrix = perspective(fovy, aspect, near, far);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureSize, textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, chessboard);
    gl.generateMipmap( gl.TEXTURE_2D )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    clampToEdgeButton.addEventListener("click", function (event) {
        clampToEdgeButton.disabled = true;
        repeatButton.disabled = false;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    });

    repeatButton.addEventListener("click", function (event) {
        clampToEdgeButton.disabled = false;
        repeatButton.disabled = true;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    });

    $('.selectpicker').on('change',  function (event) {
        switch (filteringModeMenu.selectedIndex) {
            case 0:
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                break;
            case 1:
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                break;
            case 2:
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                break;
            case 3:
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                break;
        }
    });

    render();
};


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);
    requestAnimFrame(render);
}
