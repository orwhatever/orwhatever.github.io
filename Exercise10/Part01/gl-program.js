/**
 * Created by jga on 12/9/15.
 */
function generateProgram(){
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    program.vPositionLoc = gl.getAttribLocation(program, "vPosition");
    program.cubeSampler = gl.getUniformLocation(program, "cubeSampler");
    program.normalSampler = gl.getUniformLocation(program, "normalSampler");
    program.isMirrorLoc = gl.getUniformLocation(program, "isMirror");
    program.modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    program.projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    program.MtexLoc = gl.getUniformLocation(program, "Mtex");
    program.eyeLoc = gl.getUniformLocation(program, "eye");
    return program;
}