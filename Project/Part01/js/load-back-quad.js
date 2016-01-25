/**
 * Created by jga on 12/10/15.
 */

function loadBackgroundQuad(projectionMatrix, modelViewMatrix) {

    var backgroundQuad = new Object();
    backgroundQuad.projectionMatrix = projectionMatrix;
    backgroundQuad.modelViewMatrix = modelViewMatrix;

    //Back

    var v_ul = vec4(-1, 1, -1, 1);
    var v_ll = vec4(-1, -1, -1, 1);
    var v_ur = vec4(1, 1, -1, 1);
    var v_lr = vec4(1, -1, -1, 1);


    var vertices = [];

    vertices.push(v_ul);
    vertices.push(v_ll);
    vertices.push(v_lr);

    vertices.push(v_ul);
    vertices.push(v_ur);
    vertices.push(v_lr);

    var colors = [];
    colors.push(vec4(0, 0.3, 0, 1));
    colors.push(vec4(0, 0.3, 0, 1));
    colors.push(vec4(0, 0.3, 0, 1));
    colors.push(vec4(0, 0.3, 0, 1));
    colors.push(vec4(0, 0.3, 0, 1));
    colors.push(vec4(0, 0.3, 0, 1));


    //Left

    v_ul = vec4(-1, 1, 1, 1);
    v_ll = vec4(-1, -1, 1, 1);
    v_ur = vec4(-1, 1, -1, 1);
    v_lr = vec4(-1, -1, -1, 1);


    vertices.push(v_ul);
    vertices.push(v_ll);
    vertices.push(v_lr);

    vertices.push(v_ul);
    vertices.push(v_ur);
    vertices.push(v_lr);

    colors.push(vec4(0, 0, 0.3, 1));
    colors.push(vec4(0, 0, 0.3, 1));
    colors.push(vec4(0, 0, 0.3, 1));
    colors.push(vec4(0, 0, 0.3, 1));
    colors.push(vec4(0, 0, 0.3, 1));
    colors.push(vec4(0, 0, 0.3, 1));

    v_ul = vec4(-1, -1, -1, 1);
    v_ll = vec4(-1, -1, 1, 1);
    v_ur = vec4(1, -1, -1, 1);
    v_lr = vec4(1, -1, 1, 1);

    vertices.push(v_ul);
    vertices.push(v_ll);
    vertices.push(v_lr);

    vertices.push(v_ul);
    vertices.push(v_ur);
    vertices.push(v_lr);

    colors.push(vec4(0.3, 0, 0, 1));
    colors.push(vec4(0.3, 0, 0, 1));
    colors.push(vec4(0.3, 0, 0, 1));
    colors.push(vec4(0.3, 0, 0, 1));
    colors.push(vec4(0.3, 0, 0, 1));
    colors.push(vec4(0.3, 0, 0, 1));


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


    backgroundQuad.n_vertices = vertices.length;

    return backgroundQuad;
}