// OBJ File has been read compreatly
function loadFloor(projectionMatrix, viewMatrix) {


    var floorObject = new Object();
    floorObject.projectionMatrix = projectionMatrix;
    floorObject.viewMatrix = viewMatrix;
    floorObject.modelMatrix = mat4();


    var pointsArray = [];
    var texCoordsArray = [];

    var floorVertexA = vec3(-2, -1, -1);
    var floorVertexB = vec3(+2, -1, -1);
    var floorVertexC = vec3(+2, -1, -5);
    var floorVertexD = vec3(-2, -1, -5);

    var texCoordA = vec2(0.0, 0.0);
    var texCoordB = vec2(1.0, 0.0);
    var texCoordC = vec2(1.0, 1.0);
    var texCoordD = vec2(0.0, 1.0);

    pushTriangle(pointsArray, floorVertexC, floorVertexD, floorVertexA);
    pushTriangle(pointsArray, floorVertexA, floorVertexB, floorVertexC);

    pushTriangleTexCoord(texCoordsArray, texCoordC, texCoordD, texCoordA);
    pushTriangleTexCoord(texCoordsArray, texCoordA, texCoordB, texCoordC);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    floorObject.vertexBuffer = vertexBuffer;

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    floorObject.tBuffer = tBuffer;

    var image = document.getElementById("floorTex");

    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);

    floorObject.texture = texture;

    return floorObject;
}

function pushTriangle(pointsArray, a, b, c) {
    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);
}

function pushTriangleTexCoord(texCoordsArray, a, b, c) {
    texCoordsArray.push(a);
    texCoordsArray.push(b);
    texCoordsArray.push(c);
}