export default `
    uniform vec3 uColor;
    uniform float uGlowIntensity;
    uniform float uTime;
    varying vec2 vUv;

    float hash(float n) { 
        return fract(sin(n) * 43758.5453123); 
    }

    float noise(float x) {
        float i = floor(x);
        float f = fract(x);
        float u = f * f * (3.0 - 2.0 * f);
        return mix(hash(i), hash(i + 1.0), u);
    }

    void main() {
        float verticalFade = pow(vUv.y, 4.0);

        float horizontalFade = sin(vUv.x * 3.14159265);
        horizontalFade = pow(horizontalFade, 2.5);

        float ray1 = noise(vUv.x * 20.0 + uTime * 0.1);
        float ray2 = noise(vUv.x * 45.0 - uTime * 0.05);

        float raysTexture = (ray1 * 0.6 + ray2 * 0.4);

        float finalAlpha = verticalFade * horizontalFade * raysTexture;
        if (finalAlpha < 0.001) discard;

        vec3 finalColor = uColor * uGlowIntensity;

        gl_FragColor = vec4(finalColor, finalAlpha);
    }
`;
