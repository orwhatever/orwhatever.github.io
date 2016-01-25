"use strict";

var gl;
var canvas;


var floorObject;
var teapotObject;

var theta = 0.0;
var eye = vec3(0, 0, 0);
var light = vec3(0, 2, -2);
var lightAt = vec3(0, 0, -2);
var lightUp = vec3(0.0, 0.0, -1.0);
var lightFov_y = 90;

var normalView = true;

const near = 1.0;
const far = 10.0;


window.onload = function init() {
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas, null);
    if (!gl) {
        alert("WebGL isn't available");
    }


    var aspect = canvas.width / canvas.height;
    var fov_y = 45.0;  // Field-of-view in Y direction angle (in degrees)

    var I = mat4();
    var projectionMatrix = perspective(fov_y, aspect, near, far);

    generateTeapotProgram();
    generateShadowProgram();
    generateFloorProgram();

    loadTeapot(projectionMatrix, I);
    floorObject = loadFloor(projectionMatrix, I);

    document.getElementById("toggleBtn").onclick = function () {
        normalView = !normalView;

        if (normalView) {
            floorObject.projectionMatrix = perspective(fov_y, aspect, near, far);
            floorObject.viewMatrix = I;
            teapotObject.projectionMatrix = perspective(fov_y, aspect, near, far);
            teapotObject.viewMatrix = I;
        } else {
            floorObject.projectionMatrix = shadowProgram.shadowProjectionMatrix;
            floorObject.viewMatrix = shadowProgram.shadowViewMatrix;
            teapotObject.projectionMatrix = shadowProgram.shadowProjectionMatrix;
            teapotObject.viewMatrix = shadowProgram.shadowViewMatrix;
        }
    };

    render();
};


function render() {

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    teapotObject = retrieveTeapotObject();
    if (teapotObject) {
        generateShadowMap();
        drawTeapot();
        theta = (theta + 0.05) % (2 * Math.PI);
        teapotObject.modelMatrix = translate(0, -0.6 + 0.4 * Math.sin(theta), -3);
    }
    drawFloor();

    window.requestAnimFrame(render);
}

function generateShadowMap() {
    gl.useProgram(shadowProgram);

    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowProgram.framebuffer);               // Change the drawing destination to FBO
    gl.viewport(0, 0, shadowTexture_width, shadowTexture_height); // Set view port for FBO

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);   // Clear FBO
    gl.enable(gl.DEPTH_TEST);

    gl.activeTexture(gl.TEXTURE0); // Set a texture object to the texture unit
    gl.bindTexture(gl.TEXTURE_2D, shadowProgram.framebuffer.texture);


    gl.bindBuffer(gl.ARRAY_BUFFER, teapotObject.vertexBuffer);
    gl.vertexAttribPointer(shadowProgram.vPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shadowProgram.vPositionLoc);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotObject.indexBuffer);

    gl.uniformMatrix4fv(shadowProgram.projectionMatrixLoc, false, flatten(shadowProgram.shadowProjectionMatrix));
    gl.uniformMatrix4fv(shadowProgram.viewMatrixLoc, false, flatten(shadowProgram.shadowViewMatrix));
    gl.uniformMatrix4fv(shadowProgram.modelMatrixLoc, false, flatten(teapotObject.modelMatrix));

    gl.drawElements(gl.TRIANGLES, teapotObject.n_elements, gl.UNSIGNED_SHORT, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, floorObject.vertexBuffer);
    gl.vertexAttribPointer(shadowProgram.vPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shadowProgram.vPositionLoc);

    gl.uniformMatrix4fv(shadowProgram.projectionMatrixLoc, false, flatten(shadowProgram.shadowProjectionMatrix));
    gl.uniformMatrix4fv(shadowProgram.viewMatrixLoc, false, flatten(shadowProgram.shadowViewMatrix));
    gl.uniformMatrix4fv(shadowProgram.modelMatrixLoc, false, flatten(floorObject.modelMatrix));


    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);               // Change the drawing destination to color buffer
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function drawFloor() {
    gl.useProgram(floorProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, floorObject.vertexBuffer);
    gl.vertexAttribPointer(floorProgram.vPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(floorProgram.vPositionLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, floorObject.tBuffer);
    gl.vertexAttribPointer(floorProgram.vTexCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(floorProgram.vTexCoordLoc);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, floorObject.texture);
    gl.uniform1i(floorProgram.samplerLoc, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, shadowProgram.framebuffer.texture);
    gl.uniform1i(floorProgram.shadowSamplerLoc, 1);

    gl.uniformMatrix4fv(floorProgram.projectionMatrixLoc, false, flatten(floorObject.projectionMatrix));
    gl.uniformMatrix4fv(floorProgram.viewMatrixLoc, false, flatten(floorObject.viewMatrix));
    gl.uniformMatrix4fv(floorProgram.modelMatrixLoc, false, flatten(floorObject.modelMatrix));

    gl.uniformMatrix4fv(floorProgram.shadowProjectionMatrixLoc, false, flatten(shadowProgram.shadowProjectionMatrix));
    gl.uniformMatrix4fv(floorProgram.shadowViewMatrixLoc, false, flatten(shadowProgram.shadowViewMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function drawTeapot() {
    gl.useProgram(teapotProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, teapotObject.vertexBuffer);
    gl.vertexAttribPointer(teapotProgram.vPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(teapotProgram.vPositionLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, teapotObject.normalBuffer);
    gl.vertexAttribPointer(teapotProgram.vNormalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(teapotProgram.vNormalLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, teapotObject.colorBuffer);
    gl.vertexAttribPointer(teapotProgram.vColorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(teapotProgram.vColorLoc);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotObject.indexBuffer);

    gl.uniformMatrix4fv(teapotProgram.projectionMatrixLoc, false, flatten(teapotObject.projectionMatrix));
    gl.uniformMatrix4fv(teapotProgram.viewMatrixLoc, false, flatten(teapotObject.viewMatrix));
    gl.uniformMatrix4fv(teapotProgram.modelMatrixLoc, false, flatten(teapotObject.modelMatrix));

    gl.uniformMatrix4fv(teapotProgram.shadowProjectionMatrixLoc, false, flatten(shadowProgram.shadowProjectionMatrix));
    gl.uniformMatrix4fv(teapotProgram.shadowViewMatrixLoc, false, flatten(shadowProgram.shadowViewMatrix));

    gl.uniform4fv(teapotProgram.eyeLoc, flatten(vec4(eye, 1)));
    gl.uniform4fv(teapotProgram.lightLoc, flatten(vec4(light, 1)));

    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D, shadowProgram.framebuffer.texture);
    gl.uniform1i(teapotProgram.shadowSamplerLoc, 2);

    gl.drawElements(gl.TRIANGLES, teapotObject.n_elements, gl.UNSIGNED_SHORT, 0);
}
