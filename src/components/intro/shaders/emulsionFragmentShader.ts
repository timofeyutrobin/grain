export default `
    uniform vec3 uColor;
    uniform float uSaturation;
    uniform sampler2D uTexture;
    uniform float uGrayscale;

    varying vec2 vUv;

    void main() {
        vec4 mask = texture2D(uTexture, vUv);
        float gray = 0.21 * mask.r + 0.71 * mask.g + 0.07 * mask.b;
        gl_FragColor = vec4(mix(vec3(mask.rgb * (1.0 - uGrayscale) + (gray * uGrayscale)), uColor, uSaturation * 0.5) + 0.3, gray);
    }
`;
