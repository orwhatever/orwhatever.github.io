/**
 * Created by jga on 12/8/15.
 */

function createReflectorProjectionMatrix(viewMatrix, floorObject) {

    var P = floorObject.A;
    var N = negate(floorObject.N);

    var P_h = vec4(P, 1);
    var N_h = vec4(N, 0);


    var Pv = vec3(dot(viewMatrix[0], P_h), dot(viewMatrix[1], P_h), dot(viewMatrix[2], P_h));
    var Nv = vec3(dot(viewMatrix[0], N_h), dot(viewMatrix[1], N_h), dot(viewMatrix[2], N_h));

    var d = -dot(Pv, Nv);

    var clipPlane = vec4(Nv[0], Nv[1], Nv[2], d);

    // Just renamed the provided function
    return modifyPerspectiveMatrix(clipPlane, perspective(65, canvas.width / canvas.height, 1, 6));
}

function createReflectionMatrix(P, V) {

    var R = mat4();

    R[0] = vec4(1 - 2 * Math.pow(V[0], 2), -2 * V[0] * V[1], -2 * V[0] * V[2], 2 * dot(P, V) * V[0]);
    R[1] = vec4(-2 * V[0] * V[1], 1 - 2 * Math.pow(V[1], 2), -2 * V[1] * V[2], 2 * dot(P, V) * V[1]);
    R[2] = vec4(-2 * V[0] * V[2], -2 * V[1] * V[2], 1 - 2 * Math.pow(V[2], 2), 2 * dot(P, V) * V[2]);
    R[3] = vec4(0, 0, 0, 1.0);

    return R;
}

function modifyPerspectiveMatrix(clipplane, perspective) {
// MV.js has no copy constructor for matrices
    var oblique = mult(mat4(), perspective);
    var q = vec4((sign(clipplane[0]) + perspective[0][2]) / perspective[0][0],
        (sign(clipplane[1]) + perspective[1][2]) / perspective[1][1],
        -1.0,
        (1.0 + perspective[2][2]) / perspective[2][3]);
    var s = 2.0 / dot(clipplane, q);
    oblique[2] = vec4(clipplane[0] * s, clipplane[1] * s,
        clipplane[2] * s + 1.0, clipplane[3] * s);
    return oblique;
}
function sign(x) {
    return x > 0.0 ? 1.0 : (x < 0.0 ? -1.0 : 0.0);
}