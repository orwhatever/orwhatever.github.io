attribute vec4 vPosition;
attribute vec2 vTexCoord;

uniform mat4 shadowProjectionMatrix;
uniform mat4 shadowViewMatrix;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

varying vec4 lightRefPosition;
varying vec2 fTexCoord;

void main() {
	gl_Position = projectionMatrix * viewMatrix * modelMatrix  *vPosition;
    fTexCoord = vTexCoord;

    lightRefPosition = shadowProjectionMatrix * shadowViewMatrix * modelMatrix *vPosition;
}
