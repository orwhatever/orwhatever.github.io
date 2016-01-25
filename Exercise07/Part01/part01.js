var canvas;
var gl;
var program;

var pointsArray = [];
var texCoordsArray = [];
var texture;

var near = 1.0;
var far = 6.0;
var fovy = 90.0;  // Field-of-view in Y direction angle (in degrees)
var aspect = 1.0;       // Viewport aspect ratio
var theta = 0.0;

var modelViewMatrixLoc;
var projectionMatrixLoc;

var light;


var vertex1A = vec4(-2, -1, -1, 1);
var vertex1B = vec4(+2, -1, -1, 1);
var vertex1C = vec4(+2, -1, -5, 1);
var vertex1D = vec4(-2, -1, -5, 1);

var vertex2A = vec4(0.25, -0.5, -1.25, 1);
var vertex2B = vec4(0.75, -0.5, -1.25, 1);
var vertex2C = vec4(0.75, -0.5, -1.75, 1);
var vertex2D = vec4(0.25, -0.5, -1.75, 1);

var vertex3A = vec4(-1, -1, -2.5, 1);
var vertex3B = vec4(-1, 0.0, -2.5, 1);
var vertex3C = vec4(-1, 0.0, -3, 1);
var vertex3D = vec4(-1, -1, -3, 1);

var texCoordA = vec2(0.0, 0.0);
var texCoordB = vec2(1.0, 0.0);
var texCoordC = vec2(1.0, 1.0);
var texCoordD = vec2(0.0, 1.0);

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
    gl = WebGLUtils.setupWebGL(canvas, {alpha: false, stencil: true});
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3, 0.3, 0.3, 1.0);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    aspect = canvas.width / canvas.height;

    triangle(vertex1C, vertex1D, vertex1A);
    triangle(vertex1A, vertex1B, vertex1C);

    triangle(vertex2C, vertex2D, vertex2A);
    triangle(vertex2A, vertex2B, vertex2C);

    triangle(vertex3C, vertex3D, vertex3A);
    triangle(vertex3A, vertex3B, vertex3C);

    triangleTexCoord(texCoordC, texCoordD, texCoordA);
    triangleTexCoord(texCoordA, texCoordB, texCoordC);

    triangleTexCoord(texCoordC, texCoordD, texCoordA);
    triangleTexCoord(texCoordA, texCoordB, texCoordC);

    triangleTexCoord(texCoordC, texCoordD, texCoordA);
    triangleTexCoord(texCoordA, texCoordB, texCoordC);

    var redTexture = new Uint8Array([255, 0, 0]);
    var blackTexture = new Uint8Array([0, 0, 0, 220]);
    var image = document.getElementById("floorTex");

    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, redTexture);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, blackTexture);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

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
    render();
};


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.depthMask(gl.False);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


    var textureLoc = gl.getUniformLocation(program, "texture");
    var projectionMatrix = perspective(fovy, aspect, near, far);
    var modelViewMatrix = mat4();

    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Floor
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniform1i(textureLoc, 0);

    gl.enable(gl.STENCIL_TEST);
    gl.stencilFunc(gl.ALWAYS, 1, 0xFF);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
    gl.drawArrays(gl.TRIANGLES, 0, 6);


    theta = (theta + 0.01) % (2 * Math.PI);
    light = add(vec3(0, 2, -2), vec3(2 * Math.sin(theta), 0, 2 * Math.cos(theta)));

    var M = mat4();
    M[3][3] = 0;
    M[3][1] = -1 / (light[1] + 1.0);

    modelViewMatrix = mult(modelViewMatrix, translate(light[0], light[1], light[2]));
    modelViewMatrix = mult(modelViewMatrix, M);
    modelViewMatrix = mult(modelViewMatrix, translate(-light[0], -light[1], -light[2]));

    // Set Up Model View Matrix for Shadows
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.stencilFunc(gl.EQUAL, 1, 0xFF);

    // Quad Shadow
    gl.uniform1i(textureLoc, 2);
    gl.drawArrays(gl.TRIANGLES, 6, 6);

    // Vertical Quad Shadow
    gl.uniform1i(textureLoc, 2);
    gl.drawArrays(gl.TRIANGLES, 12, 6);

    gl.stencilFunc(gl.ALWAYS, 1, 0xFF);

    // Quad
    modelViewMatrix = mat4();
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniform1i(textureLoc, 1);
    gl.drawArrays(gl.TRIANGLES, 6, 6);

    // Vertical Quad
    modelViewMatrix = mat4();
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniform1i(textureLoc, 1);
    gl.drawArrays(gl.TRIANGLES, 12, 6);


    requestAnimFrame(render);
}
