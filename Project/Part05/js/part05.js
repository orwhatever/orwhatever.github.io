var program;
var canvas;
var gl;

const near = 0.3;
const far = 20.0;

const eye = vec3(0.9, 0, 0);
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

const fovy = 90.0;  // Field-of-view in Y direction angle (in degrees)
const aspect = 1.0;       // Viewport aspect ratio

var modelViewMatrix, projectionMatrix;
var sphereObject;
var backgroundObject;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    var aspect = canvas.width / canvas.height;

    gl = WebGLUtils.setupWebGL(canvas, null);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = generateProgram();
    gl.useProgram(program);

    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, near, far);

    loadTexture();

    sphereObject = loadSphere(projectionMatrix, modelViewMatrix);
    backgroundObject = loadBackgroundQuad(projectionMatrix, modelViewMatrix);



    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawSphere();
    drawBackground();
}

function drawSphere() {

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereObject.vertexBuffer);
    gl.vertexAttribPointer(program.vPositionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vPositionLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphereObject.normalBuffer);
    gl.vertexAttribPointer(program.vNormalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vNormalLoc);

    gl.uniformMatrix4fv(program.projectionMatrixLoc, false, flatten(sphereObject.projectionMatrix));
    gl.uniformMatrix4fv(program.viewMatrixLoc, false, flatten(sphereObject.viewMatrix));
    gl.uniformMatrix4fv(program.modelMatrixLoc, false, flatten(sphereObject.modelMatrix));

    gl.uniform1i(program.isMirrorLoc, 1);
    gl.uniform4fv(program.eyeLoc,vec4(eye));


    gl.uniform1i(program.cubeSampler, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, sphereObject.normalMap);
    gl.uniform1i(program.normalSampler, 1);

    gl.drawArrays(gl.TRIANGLES, 0, sphereObject.n_vertices);
}

function drawBackground() {

    gl.bindBuffer(gl.ARRAY_BUFFER, backgroundObject.vertexBuffer);
    gl.vertexAttribPointer(program.vPositionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vPositionLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, backgroundObject.normalBuffer);
    gl.vertexAttribPointer(program.vNormalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vNormalLoc);

    gl.uniformMatrix4fv(program.projectionMatrixLoc, false, flatten(backgroundObject.projectionMatrix));
    gl.uniformMatrix4fv(program.viewMatrixLoc, false, flatten(backgroundObject.viewMatrix));
    gl.uniformMatrix4fv(program.modelMatrixLoc, false, flatten(backgroundObject.modelMatrix));

    gl.uniform1i(program.isMirrorLoc, 0);
    gl.uniform4fv(program.eyeLoc,vec4(eye));

    gl.uniform1i(program.cubeSampler, 0);

    gl.drawArrays(gl.TRIANGLES, 0, backgroundObject.n_vertices);
}