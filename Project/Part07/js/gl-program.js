/**
 * Created by jga on 12/9/15.
 */
function generateProgram(){
    var program = initShaders(gl, "shaders/vertexShader.glsl", "shaders/fragmentShader.glsl");
    program.vPositionLoc = gl.getAttribLocation(program, "vPosition");
    program.vNormalLoc = gl.getAttribLocation(program, "vNormal");

    program.cubeSampler = gl.getUniformLocation(program, "cubeSampler");
    program.normalSampler = gl.getUniformLocation(program, "normalSampler");
    program.isMirrorLoc = gl.getUniformLocation(program, "isMirror");

    program.projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    program.viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    program.modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");


    program.eyeLoc = gl.getUniformLocation(program, "eye");
    return program;
}