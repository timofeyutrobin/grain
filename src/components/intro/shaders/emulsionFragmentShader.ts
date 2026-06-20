export default `
    uniform vec3 uColor;
    uniform float uSaturation;
    uniform sampler2D uTexture;

    varying vec2 vUv;

    void main() {
        vec4 mask = texture2D(uTexture, vUv);
        gl_FragColor = vec4(mix(mask.rgb, uColor, uSaturation * 0.5) + 0.3, mask.r);
    }
`;
