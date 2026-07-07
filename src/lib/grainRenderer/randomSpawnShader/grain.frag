#version 300 es

#define PI 3.14159265359

precision highp float;
precision highp sampler2D;

in vec2 vUV;
out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_contrast;
uniform float u_sensitivity;
uniform float u_grainSize;
uniform float u_alpha;
uniform uint u_seed;

uniform sampler2D u_imageTexture;

uvec2 pcg2d(uvec2 v) {
  v.x ^= u_seed;
  v.y += u_seed;

  v = v * 1664525u + 1013904223u;

  v.x += v.y * 1664525u;
  v.y += v.x * 1664525u;

  v = v ^ (v >> 16u);

  v.x += v.y * 1664525u;
  v.y += v.x * 1664525u;

  v = v ^ (v >> 16u);

  return v;
}

float curve(float x, float contrast, float sensitivity) {
  return pow(x, contrast) /
    (pow(x, contrast) + pow(1.0f - x, contrast)) *
    pow(x, sensitivity);
}

float grainDistance(vec2 center, vec2 rand, vec2 gridUV, float aspectRatio) {
  vec2 pos = gridUV - center;
  float dist = length(vec2(pos.x * aspectRatio, pos.y));
  float angle = atan(pos.y, pos.x);
  dist += sin(angle * floor(rand.x * 3.0f + 3.0f) + rand.y * 2.0f * PI) * 0.05f;

  return dist;
}

float grainMask(float size, float dist) {
  return smoothstep(size, size * 0.7f, dist);
}

vec3 grainColor(float size, float dist) {
  vec3 grainColor = vec3(0.8f, 0.8f, 0.8f);
  float grainCenterDensity = smoothstep(size * 0.5f, size, dist);
  float grainInnerNoise = vec2(pcg2d(uvec2(vUV * u_resolution))).x / float(uint(0xffffffff));

  return grainColor * (0.7f + grainCenterDensity) + (grainInnerNoise * 0.2f - 0.1f);
}

float grayScale(vec4 color) {
  return dot(color.rgb, vec3(0.2126f, 0.7152f, 0.0722f));
}

float grainExposure(vec2 textureUV) {
  return grayScale(textureLod(u_imageTexture, textureUV, 0.0f));
}

void main() {
  float aspectRatio = u_resolution.x / u_resolution.y;
  float gridSize = u_resolution.x / (u_grainSize * 0.5f);
  float baseGrainSize = 1.0f;

  vec4 finalColor = vec4(0.0f, 0.0f, 0.0f, 0.0f);

  vec2 gridUV = vUV * gridSize;
  vec2 currentTile = floor(gridUV);

  for(int x = -3; x <= 3; x++) {
    for(int y = -3; y <= 3; y++) {
      vec2 tileOffset = vec2(float(x), float(y));
      vec2 targetTile = currentTile + tileOffset;

      vec2 rand = vec2(pcg2d(uvec2(targetTile))) / float(uint(0xffffffff));

      vec2 grainCenter = targetTile + (rand.xy - 0.5f) * 2.0f;
      vec2 textureUV = grainCenter / gridSize;

      float size = baseGrainSize * ((rand.x * 1.3f) + baseGrainSize);
      float dist = grainDistance(grainCenter, rand, gridUV, aspectRatio);
      float mask = grainMask(size, dist);
      vec3 color = grainColor(size, dist);

      float exposure = grainExposure(textureUV);

      float exposureThreshold = (rand.x + rand.y) * 0.5f;
      float grainActivation = step(exposureThreshold, curve(exposure, u_contrast, u_sensitivity));

      finalColor = vec4(mix(finalColor.rgb, color, grainActivation * mask * u_alpha), grainActivation * mask * u_alpha);
    }
  }
  outColor = finalColor;
}
