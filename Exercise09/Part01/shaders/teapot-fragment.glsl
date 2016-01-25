precision mediump float;
uniform sampler2D shadowSampler;


varying vec4 lightRefPosition;
varying vec4 color;

varying vec4 L;
varying vec4 normal;
varying vec4 v;
varying vec4 r;


void main();
float unpackDepth(const in vec4 rgbaDepth);

void main() {

	vec3 Kd = color.rgb;
	vec3 Ks = vec3(0.9, 0.9, 0.9);
    float shininess = 30.0;

	vec3 diffuseColor = Kd * max(dot(normal, L), 0.0);
	vec3 spectralColor = Ks * pow(max(dot(r,v), 0.0),shininess);

    vec3 shadowCoord = (lightRefPosition.xyz/lightRefPosition.w)/2.0 + 0.5;
    vec4 rgbaDepth = texture2D(shadowSampler, shadowCoord.xy);
    float depth =  unpackDepth(rgbaDepth); // Retrieve the z-value from R
    float visibility = (shadowCoord.z > depth + 0.005) ? 0.7 : 1.0;
    gl_FragColor = vec4(diffuseColor * visibility + spectralColor, color.a);
}

float unpackDepth(const in vec4 rgbaDepth) {
	const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
	float depth = dot(rgbaDepth, bitShift); // Use dot() since the calculations is same
	return depth;
}