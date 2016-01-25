#define M_PI 3.1415926535897932384626433832795
precision mediump float;

varying vec4 worldPositon;
varying vec4 normal;

uniform samplerCube cubeSampler;
uniform sampler2D normalSampler;
uniform bool isMirror;
uniform vec4 eye;

void main()
{
	if (isMirror) {

        vec4 v = eye - worldPositon;
        vec4 r = reflect(-v,normal);

        gl_FragColor = vec4(0.7, 0.8, 0.95, 1.0)  * textureCube(cubeSampler, r.xyz);
    } else {
        gl_FragColor = textureCube(cubeSampler, worldPositon.xyz);
    }
}