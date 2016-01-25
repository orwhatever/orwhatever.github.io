precision mediump float;
uniform sampler2D shadowSampler;
uniform sampler2D sampler;

varying vec4 lightRefPosition;
varying vec2 fTexCoord;


void main();
float unpackDepth(const in vec4 rgbaDepth);

void main() {

	vec4 color = texture2D(sampler,fTexCoord);
	vec3 shadowCoord = (lightRefPosition.xyz/lightRefPosition.w)/2.0 + 0.5;
	vec4 rgbaDepth = texture2D(shadowSampler, shadowCoord.xy);
	float depth =  unpackDepth(rgbaDepth); // Retrieve the z-value from R
	float visibility = (shadowCoord.z > depth + 0.005) ? 0.7 : 1.0;
	gl_FragColor = vec4(color.rgb * visibility, color.a);
}

float unpackDepth(const in vec4 rgbaDepth) {
	const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
	float depth = dot(rgbaDepth, bitShift); // Use dot() since the calculations is same
	return depth;
}