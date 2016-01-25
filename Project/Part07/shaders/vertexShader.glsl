attribute vec4 vPosition;
attribute vec4 vNormal;

varying vec4 worldPosition;
varying vec4 normal;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

void main() {
	worldPosition = modelMatrix * vPosition;
	normal = normalize(modelMatrix * vNormal);
    gl_Position = projectionMatrix * viewMatrix  * modelMatrix * vPosition;
}