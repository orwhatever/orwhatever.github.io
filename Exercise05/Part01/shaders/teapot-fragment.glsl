precision mediump float;

varying vec4 color;
varying vec4 L;
varying vec4 normal;
varying vec4 v;
varying vec4 r;

void main() {
	vec3 Kd = color.rgb;
	vec3 Ks = vec3(0.9, 0.9, 0.9);
    float shininess = 30.0;

	vec3 diffuseColor = Kd * max(dot(normal, L), 0.0);
	vec3 spectralColor = Ks * pow(max(dot(r,v), 0.0),shininess);

    gl_FragColor = vec4(diffuseColor + spectralColor, color.a);
}
