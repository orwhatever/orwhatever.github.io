/**
 * Created by jga on 12/10/15.
 */

function loadBackgroundQuad(projectionMatrix, viewMatrix) {

    var backgroundQuad = new Object();
    backgroundQuad.projectionMatrix = projectionMatrix;
    backgroundQuad.viewMatrix = viewMatrix;
    backgroundQuad.modelMatrix = mat4();

    var vertices = [];
    var colors = [];
    var normals = []

    //Back

    var v_ul = vec4(-1, 1, -1, 1);
    var v_ll = vec4(-1, -1, -1, 1);
    var v_ur = vec4(1, 1, -1, 1);
    var v_lr = vec4(1, -1, -1, 1);
    var color = vec4(0, 0.3, 0, 1);
    var normal = vec4(0, 0, 1, 0);
    pushQuad(vertices, normals, colors, v_ul, v_ll, v_lr, v_ur, normal, color);
    //Left

    v_ul = vec4(-1, 1, 1, 1);
    v_ll = vec4(-1, -1, 1, 1);
    v_ur = vec4(-1, 1, -1, 1);
    v_lr = vec4(-1, -1, -1, 1);
    color = vec4(0, 0, 0.3, 1);
    normal = vec4(1, 0, 0, 0);
    pushQuad(vertices, normals, colors, v_ul, v_ll, v_lr, v_ur, normal, color);
    ;

    // down

    v_ul = vec4(-1, -1, -1, 1);
    v_ll = vec4(-1, -1, 1, 1);
    v_ur = vec4(1, -1, -1, 1);
    v_lr = vec4(1, -1, 1, 1);
    color = vec4(0.3, 0, 0, 1);
    normal = vec4(0, 1, 0, 0);
    pushQuad(vertices, normals, colors, v_ul, v_ll, v_lr, v_ur, normal, color);
    ;

    // up

    v_ul = vec4(-1, 1, -1, 1);
    v_ll = vec4(-1, 1, 1, 1);
    v_ur = vec4(1, 1, -1, 1);
    v_lr = vec4(1, 1, 1, 1);
    color = vec4(0.3, 0, 0, 1);
    normal = vec4(0, -1, 0, 0);
    pushQuad(vertices, normals, colors, v_ul, v_ll, v_lr, v_ur, normal, color);

    //Right
    v_ul = vec4(1, 1, 1, 1);
    v_ll = vec4(1, -1, 1, 1);
    v_ur = vec4(1, 1, -1, 1);
    v_lr = vec4(1, -1, -1, 1);
    color = vec4(0, 0, 0.3, 1);
    normal = vec4(-1, 0, 0, 0);
    pushQuad(vertices, normals, colors, v_ul, v_ll, v_lr, v_ur, normal, color);

    //Back

    v_ul = vec4(-1, 1, 1, 1);
    v_ll = vec4(-1, -1, 1, 1);
    v_ur = vec4(1, 1, 1, 1);
    v_lr = vec4(1, -1, 1, 1);
    color = vec4(0, 0.3, 0, 1);
    normal = vec4(0, 0, -1, 0);
    pushQuad(vertices, normals, colors, v_ul, v_ll, v_lr, v_ur, normal, color);;


    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    backgroundQuad.vertexBuffer = vertexBuffer;

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    backgroundQuad.colorBuffer = colorBuffer;

    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    backgroundQuad.normalBuffer = normalBuffer;



    backgroundQuad.n_vertices = vertices.length;

    return backgroundQuad;
}

function pushQuad(vertices, normals, colors, v_ul, v_ll, v_lr, v_ur, normal, color) {
    vertices.push(v_ul);
    vertices.push(v_ll);
    vertices.push(v_lr);

    vertices.push(v_ul);
    vertices.push(v_ur);
    vertices.push(v_lr);

    colors.push(color);
    colors.push(color);
    colors.push(color);
    colors.push(color);
    colors.push(color);
    colors.push(color);

    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
}