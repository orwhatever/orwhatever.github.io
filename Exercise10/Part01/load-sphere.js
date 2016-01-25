/**
 * Created by jga on 12/9/15.
 */

var pointsArray = [];
var normalsArray = [];

function loadSphere(projectionMatrix, modelViewMatrix) {


    var numTimesToSubdivide = 7;

    var vertexA = vec4(0.0, 0.0, -1.0, 1);
    var vertexB = vec4(0.0, 0.942809, 0.333333, 1);
    var vertexC = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vertexD = vec4(0.816497, -0.471405, 0.333333, 1);


    var sphereObject = new Object();
    sphereObject.projectionMatrix = projectionMatrix;
    sphereObject.modelViewMatrix = modelViewMatrix;
    sphereObject.Mtex = mat4();

    tetrahedron(vertexA, vertexB, vertexC, vertexD, numTimesToSubdivide);


    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    sphereObject.vertexBuffer = vertexBuffer;


    var cmLeft = document.getElementById("cmLeft");
    var cmRight = document.getElementById("cmRight");
    var cmTop = document.getElementById("cmTop");
    var cmBottom = document.getElementById("cmBottom");
    var cmBack = document.getElementById("cmBack");
    var cmFront = document.getElementById("cmFront");

    var normalMapImage = document.getElementById("normalMap");


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
    sphereObject.cubeMap = cubeMap;

    gl.activeTexture(gl.TEXTURE1);
    var normalMap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, normalMap);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, normalMapImage);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
    sphereObject.normalMap = normalMap;



    sphereObject.n_vertices = pointsArray.length;

    return sphereObject;
}

function triangle(a, b, c) {
    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);

    // The normal is the position vertex, since we are on a unit sphere.
    // In homogeneous coordinates setting 4th element to zero since, the normal
    // is a vector
    var normalA = vec4(a[0], a[1], a[2], 0.0);
    var normalB = vec4(b[0], b[1], b[2], 0.0);
    var normalC = vec4(c[0], c[1], c[2], 0.0);

    normalsArray.push(normalA);
    normalsArray.push(normalB);
    normalsArray.push(normalC);
}


function divideTriangle(a, b, c, count) {
    if (count > 0) {

        var ab = normalize(mix(a, b, 0.5), true);
        var ac = normalize(mix(a, c, 0.5), true);
        var bc = normalize(mix(b, c, 0.5), true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }
    else { // draw tetrahedron at end of recursion
        triangle(a, b, c);
    }
}

function tetrahedron(a, b, c, d, n) {
    pointsArray = [];
    normalsArray = [];

    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}
