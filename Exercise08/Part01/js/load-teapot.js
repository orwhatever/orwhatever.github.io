/**
 * Created by jga on 12/1/15.
 */
// Create an buffer object and perform an initial configuration
var _model = null;
var _objDoc = null;      // The information of OBJ file

function loadTeapot(projectionMatrix, viewMatrix) {

    _model = new Object();
    _model.projectionMatrix = projectionMatrix;
    _model.viewMatrix = viewMatrix;
    _model.modelMatrix = translate(0, -1, -3);

    // Start reading the OBJ file
    retrieveOBJFile('images/teapot.obj', 0.25, true);
}


function retrieveTeapotObject() {
    var readCompleted = populateModel(gl, _model, _objDoc);
    if (readCompleted == true) {
        return _model;
    }
    else {
        return null;
    }
}

// Retrieve object using AJAX
function retrieveOBJFile(fileName, scale, reverse) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status !== 404) {
            parseOBJFile(request.responseText, fileName, scale, reverse);
        }
    };
    request.open('GET', fileName, true); // Create a request to acquire the file
    request.send();                      // Send the request
}

function parseOBJFile(fileString, fileName, scale, reverse) {
    var objDoc = new OBJDoc(fileName);  // Create a OBJDoc object
    var result = objDoc.parse(fileString, scale, reverse); // Parse the file
    if (!result) {
        objDoc = null;
        console.log("OBJ file parsing error.");
    }
    _objDoc = objDoc;
}

function populateModel(gl, model, objDoc) {
    var readCompleted = false;
    if (objDoc != null && objDoc.isMTLComplete()) {
        // Acquire the vertex coordinates and colors from OBJ file
        var drawingInfo = objDoc.getDrawingInfo();

        model.n_elements = drawingInfo.indices.length;

        // Write date into the buffer object

        var vertexBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        model.vertexBuffer = vertexBuffer;

        var colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        model.colorBuffer = colorBuffer;

        var normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        model.normalBuffer = normalBuffer;

        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        model.indexBuffer = indexBuffer;

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        readCompleted = true;

    }
    return readCompleted;

}
