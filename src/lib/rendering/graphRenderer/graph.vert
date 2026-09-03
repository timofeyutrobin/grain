#version 300 es
layout(location = 0) in vec2 position;
out vec2 vUV;

void main() {
    gl_Position = vec4(position, 0.0f, 1.0f);

    vUV = position * 0.5f + 0.5f;
}
