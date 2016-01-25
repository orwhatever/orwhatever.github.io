/**
 * Created by jga on 12/2/15.
 */
var teapotProgram;
var floorProgram;
var shadowProgram;

const shadowTexture_width = 2048;
const shadowTexture_height = 2048;

const shadowTexture_near = 1;
const shadowTexture_far = 10;

function generateTeapotProgram() {
    teapotProgram = initShaders(gl, "shaders/teapot-vertex.glsl", "shaders/teapot-fragment.glsl");
    teapotProgram.vPositionLoc = gl.getAttribLocation(teapotProgram, 'vPosition');
    teapotProgram.vNormalLoc = gl.getAttribLocation(teapotProgram, 'vNormal');
    teapotProgram.vColorLoc = gl.getAttribLocation(teapotProgram, 'vColor');
    teapotProgram.projectionMatrixLoc = gl.getUniformLocation(teapotProgram, "projectionMatrix");
    teapotProgram.viewMatrixLoc = gl.getUniformLocation(teapotProgram, "viewMatrix");
    teapotProgram.modelMatrixLoc = gl.getUniformLocation(teapotProgram, "modelMatrix");
    teapotProgram.shadowProjectionMatrixLoc = gl.getUniformLocation(teapotProgram, "shadowProjectionMatrix");
    teapotProgram.shadowViewMatrixLoc = gl.getUniformLocation(teapotProgram, "shadowViewMatrix");
    teapotProgram.shadowSamplerLoc = gl.getUniformLocation(teapotProgram, "shadowSampler");

    teapotProgram.eyeLoc = gl.getUniformLocation(teapotProgram, "eye");
    teapotProgram.lightLoc = gl.getUniformLocation(teapotProgram, "light");
}

function generateFloorProgram() {
    floorProgram = initShaders(gl, "shaders/floor-vertex.glsl", "shaders/floor-fragment.glsl");
    floorProgram.vPositionLoc = gl.getAttribLocation(floorProgram, 'vPosition');
    floorProgram.vTexCoordLoc = gl.getAttribLocation(floorProgram, 'vTexCoord');
    floorProgram.samplerLoc = gl.getUniformLocation(floorProgram, "sampler");
    floorProgram.projectionMatrixLoc = gl.getUniformLocation(floorProgram, "projectionMatrix");
    floorProgram.viewMatrixLoc = gl.getUniformLocation(floorProgram, "viewMatrix");
    floorProgram.modelMatrixLoc = gl.getUniformLocation(floorProgram, "modelMatrix");
    floorProgram.shadowProjectionMatrixLoc = gl.getUniformLocation(floorProgram, "shadowProjectionMatrix");
    floorProgram.shadowViewMatrixLoc = gl.getUniformLocation(floorProgram, "shadowViewMatrix");
    floorProgram.shadowSamplerLoc = gl.getUniformLocation(floorProgram, "shadowSampler");
}

function generateShadowProgram() {
    shadowProgram = initShaders(gl, "shaders/shadow-vertex.glsl", "shaders/shadow-fragment.glsl");
    shadowProgram.vPositionLoc = gl.getAttribLocation(shadowProgram, 'vPosition');
    shadowProgram.projectionMatrixLoc = gl.getUniformLocation(shadowProgram, "projectionMatrix");
    shadowProgram.viewMatrixLoc = gl.getUniformLocation(shadowProgram, "viewMatrix");
    shadowProgram.modelMatrixLoc = gl.getUniformLocation(shadowProgram, "modelMatrix");
    shadowProgram.framebuffer = initFramebufferObject();
    shadowProgram.shadowProjectionMatrix = perspective(lightFov_y, shadowTexture_width / shadowTexture_height, shadowTexture_near, shadowTexture_far);
    shadowProgram.shadowViewMatrix = lookAt(light,lightAt,lightUp);
}


function initFramebufferObject() {
    var framebuffer, texture, depthBuffer;

    // Define the error handling function
    var error = function () {
        if (framebuffer) gl.deleteFramebuffer(framebuffer);
        if (texture) gl.deleteTexture(texture);
        if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
        return null;
    };

    // Create a framebuffer object (FBO)
    framebuffer = gl.createFramebuffer();
    if (!framebuffer) {
        console.log('Failed to create frame buffer object');
        return error();
    }

    // Create a texture object and set its size and parameters
    texture = gl.createTexture(); // Create a texture object
    if (!texture) {
        console.log('Failed to create texture object');
        return error();
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, shadowTexture_width, shadowTexture_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // Create a renderbuffer object and Set its size and parameters
    depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
    if (!depthBuffer) {
        console.log('Failed to create renderbuffer object');
        return error();
    }
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, shadowTexture_width, shadowTexture_height);

    // Attach the texture and the renderbuffer object to the FBO
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    // Check if FBO is configured correctly
    var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (gl.FRAMEBUFFER_COMPLETE !== e) {
        console.log('Frame buffer object is incomplete: ' + e.toString());
        return error();
    }

    framebuffer.texture = texture; // keep the required object

    // Unbind the buffer object
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    return framebuffer;
}

