attribute vec4 vPosition;
attribute vec4 vColor;

varying vec4 color;
varying vec4 worldPositon;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

void main() {
	worldPositon = vPosition;
    color = vColor;
    gl_Position = projectionMatrix * modelViewMatrix * vPosition;
}