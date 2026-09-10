#version 300 es

precision highp float;

in vec2 vUV;
out vec4 outColor;

uniform float u_contrast;
uniform float u_sensitivity;
uniform vec3 u_color;

float plot(float curve) {
    return smoothstep(curve - 0.025f, curve, vUV.y) -
        smoothstep(curve, curve + 0.025f, vUV.y);
}

float curve(float x, float contrast, float sensitivity) {
    return pow(x, contrast) /
        (pow(x, contrast) + pow(1.0f - x, contrast)) *
        pow(x, sensitivity);
}

void main() {
    float graph = curve(vUV.x, u_contrast, u_sensitivity);
    outColor = vec4(0.0f, 0.0f, 0.0f, 0.0f) + plot(graph) * vec4(u_color, 1.0f);
}
