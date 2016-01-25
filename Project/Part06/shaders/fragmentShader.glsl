#define M_PI 3.1415926535897932384626433832795
precision mediump float;

varying vec4 worldPosition;
varying vec4 normal;

uniform samplerCube cubeSampler;
uniform sampler2D normalSampler;
uniform bool isMirror;
uniform vec4 eye;

void main() {
	if (isMirror) {
		vec4 mirrorColor =vec4(0.7, 0.8, 0.95, 1.0);

		vec3 reflectivePoint = worldPosition.xyz;
        vec3 viewVector = normalize((eye.xyz - reflectivePoint));
        vec3 reflectionVector = normalize(reflect(-viewVector, normal.xyz));

        /*
         * For the specific case a = 1.0 since the direction vector is the reflectionVector which is normalized
        */

        float b = 2.0 * dot(reflectivePoint, reflectionVector);

        // Intersecting with unit-sphere R = 1.0
        float c = dot(reflectivePoint, reflectivePoint) - 1.0;

        // Note a = 1.0
        float discriminant = b*b - 4.0 * c;

        gl_FragColor = vec4(1, 0, 0, 0);

        if (discriminant > 0.0 && ((abs(sqrt(discriminant) - b) / 2.0) > 0.00001)) {

            // Note a = 1.0
			float t_far = (-b + sqrt(discriminant)) / 2.0;
			float t_near = (-b - sqrt(discriminant)) / 2.0;

			if (t_far < t_near){
		        float swap = t_far;
                t_far = t_near;
			    t_near = swap;
			}

			/* In general the reflective point will be inside the unit sphere, so the will be a negative and positive solution. We want to find the
			 intersection point, that is in the direction of the reflection vector, so we skip the negative solution (The previous sorting ensures
			 that the negative solution will be the first one) */

			if(t_near < 0.0){
				t_near = t_far;
			}

			vec3 localizedReflection = reflectivePoint + t_near * reflectionVector;
			gl_FragColor = mirrorColor *  textureCube(cubeSampler, localizedReflection);
		}

    } else {
        gl_FragColor = textureCube(cubeSampler, worldPosition.xyz);
    }
}