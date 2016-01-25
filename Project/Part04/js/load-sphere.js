/**
 * Created by jga on 12/9/15.
 */

var pointsArray = [];
var normalsArray = [];
var colorsArray = [];

function loadSphere(projectionMatrix, modelViewMatrix) {


    var numTimesToSubdivide = 7;

    var vertexA = vec4(0.0, 0.0, -1.0, 1);
    var vertexB = vec4(0.0, 0.942809, 0.333333, 1);
    var vertexC = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vertexD = vec4(0.816497, -0.471405, 0.333333, 1);


    var sphereObject = new Object();
    sphereObject.projectionMatrix = projectionMatrix;
    sphereObject.modelViewMatrix = mult(modelViewMatrix,mult(translate(-0.5,0,-0.5),scalem(0.35, 0.35, 0.35)));
    sphereObject.Mtex = mat4();

    tetrahedron(vertexA, vertexB, vertexC, vertexD, numTimesToSubdivide);


    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    sphereObject.vertexBuffer = vertexBuffer;

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    sphereObject.colorBuffer = colorBuffer;


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

    colorsArray.push(vec4(a[0], a[1], a[2], 1.0));
    colorsArray.push(vec4(b[0], b[1], b[2], 1.0));
    colorsArray.push(vec4(c[0], c[1], c[2], 1.0));
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
