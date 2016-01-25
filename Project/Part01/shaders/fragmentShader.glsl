#define M_PI 3.1415926535897932384626433832795
precision mediump float;

varying vec4 color;
varying vec4 worldPositon;

uniform samplerCube cubeSampler;
uniform sampler2D normalSampler;
uniform bool isMirror;
uniform vec4 eye;

void main()
{
    gl_FragColor = color;

}