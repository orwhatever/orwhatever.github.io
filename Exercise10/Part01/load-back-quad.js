/**
 * Created by jga on 12/10/15.
 */

function loadBackgroundQuad(projectionMatrix) {

    var backgroundQuad = new Object();
    backgroundQuad.projectionMatrix = mat4();
    backgroundQuad.modelViewMatrix = mat4();
    backgroundQuad.Mtex = inverse4(projectionMatrix);

    var v_ul = vec4(-1, 1, 0.999, 1);
    var v_ll = vec4(-1, -1, 0.999, 1);
    var v_ur = vec4(1, 1, 0.999, 1);
    var v_lr = vec4(1, -1, 0.999, 1);


    var vertices = [];

    vertices.push(v_ul);
    vertices.push(v_ll);
    vertices.push(v_lr);

    vertices.push(v_ul);
    vertices.push(v_ur);
    vertices.push(v_lr);


    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    backgroundQuad.vertexBuffer = vertexBuffer;

    var cmLeft = document.getElementById("cmLeft");
    var cmRight = document.getElementById("cmRight");
    var cmTop = document.getElementById("cmTop");
    var cmBottom = document.getElementById("cmBottom");
    var cmBack = document.getElementById("cmBack");
    var cmFront = document.getElementById("cmFront");


    gl.activeTexture(gl.TEXTURE0);
    var cubeMap = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cmLeft);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cmRight);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cmTop);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cmBottom);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cmBack);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cmFront);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    backgroundQuad.cubeMap = cubeMap;
    backgroundQuad.n_vertices = vertices.length;

    return backgroundQuad;
}