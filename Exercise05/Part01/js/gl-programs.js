/**
 * Created by jga on 12/2/15.
 */
var teapotProgram;
var floorProgram;

function generateTeapotProgram() {
    teapotProgram = initShaders(gl, "shaders/teapot-vertex.glsl", "shaders/teapot-fragment.glsl");
    teapotProgram.vPositionLoc = gl.getAttribLocation(teapotProgram, 'vPosition');
    teapotProgram.vNormalLoc = gl.getAttribLocation(teapotProgram, 'vNormal');
    teapotProgram.vColorLoc = gl.getAttribLocation(teapotProgram, 'vColor');
    teapotProgram.projectionMatrixLoc = gl.getUniformLocation(teapotProgram, "projectionMatrix");
    teapotProgram.viewMatrixLoc = gl.getUniformLocation(teapotProgram, "viewMatrix");
    teapotProgram.modelMatrixLoc = gl.getUniformLocation(teapotProgram, "modelMatrix");

    teapotProgram.eyeLoc = gl.getUniformLocation(teapotProgram, "eye");
    teapotProgram.lightLoc = gl.getUniformLocation(teapotProgram, "light");
}

function generateFloorProgram() {
    floorProgram = initShaders(gl, "shaders/floor-vertex.glsl", "shaders/floor-fragment.glsl");
    floorProgram.vPositionLoc = gl.getAttribLocation(floorProgram, 'vPosition');
    floorProgram.vTexCoordLoc = gl.getAttribLocation(floorProgram, 'vTexCoord');
    floorProgram.samplerLoc = gl.getUniformLocation(floorProgram, "sampler");
    floorProgram.projectionMatrixLoc = gl.getUniformLocation(floorProgram, "projectionMatrix");
    floorProgram.viewMatrixLoc = gl.getUniformLocation(floorProgram, "viewMatrix");
    floorProgram.modelMatrixLoc = gl.getUniformLocation(floorProgram, "modelMatrix");
}

