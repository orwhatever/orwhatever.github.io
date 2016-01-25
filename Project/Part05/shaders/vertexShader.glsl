attribute vec4 vPosition;
attribute vec4 vNormal;

varying vec4 worldPositon;
varying vec4 normal;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

void main() {
	worldPositon = modelMatrix * vPosition;
    normal = vNormal;
    gl_Position = projectionMatrix * viewMatrix  * modelMatrix * vPosition;
}