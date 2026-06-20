export default `
    uniform float uTime;
    uniform float uAmplitude;
    uniform float uFrequency;
    uniform float uSpeed;
    uniform float uSaturation;

    varying vec2 vUv;

    void main() {
        vUv = vec2(position.x / 16.0, position.y / 10.0) + 0.5;
        vec3 p = position;

        float wave = sin(uTime * uSpeed + p.x * uFrequency) * cos(uTime * uSpeed * 0.7 + p.y * uFrequency * 0.5);
        p.z += uAmplitude * wave * 0.2;

        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = 2.0;
        gl_Position = projectionMatrix * mvPosition;
    }
`;
