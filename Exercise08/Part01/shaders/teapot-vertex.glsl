attribute vec4 vPosition;
attribute vec4 vColor;
attribute vec4 vNormal;

uniform mat4 shadowProjectionMatrix;
uniform mat4 shadowViewMatrix;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec4 light;
uniform vec4 eye;


varying vec4 lightRefPosition;
varying vec4 color;

varying vec4 L;
varying vec4 normal;
varying vec4 v;
varying vec4 r;

void main() {

	vec4 worldPosition =  modelMatrix * vec4(vPosition.xyz, 1);
	normal = normalize((modelMatrix * vec4(vNormal.xyz, 0)));
	L = vec4(normalize(light.xyz - worldPosition.xyz), 0);
	v = vec4(normalize(eye.xyz - worldPosition.xyz), 0);
	r = -reflect(L,normal);


    gl_Position = projectionMatrix * viewMatrix * modelMatrix  *vPosition;
    color = vColor;

    lightRefPosition = shadowProjectionMatrix * shadowViewMatrix * modelMatrix *vPosition;
}