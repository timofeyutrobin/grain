#version 300 es

#define PI 3.14159265359
#define GRAIN_SPREAD 3.0

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

uniform vec3 u_color;
uniform int u_channel;

uniform vec2 u_currentTileOffset;
uniform vec2 u_textureOverlapScale;
uniform vec2 u_textureOverlapOffset;

uniform float u_blurRadius;

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
  return 1.0f - smoothstep(size * 0.7f, size, dist);
}

float grayScale(vec4 color) {
  return dot(color.rgb, vec3(0.2126f, 0.7152f, 0.0722f));
}

float isColorMode(int channel) {
  // channel == 0, 1, 2
  return step(0.0f, float(channel));
}

float isGrayscaleMode(int channel) {
  // channel == -1
  return step(1.0f, -float(channel));
}

float grainExposure(vec2 textureUV, int channel) {
  vec4 image = textureLod(u_imageTexture, textureUV, 0.0f);
  return isColorMode(channel) * image[channel] + isGrayscaleMode(channel) * grayScale(image);
}

vec3 grainColor(float size, float dist) {
  float grainCenterDensity = smoothstep(size * 0.1f, size, dist);

  return u_color * (1.5f - grainCenterDensity);
}

void main() {
  float aspectRatio = u_resolution.x / u_resolution.y;
  float gridSize = u_resolution.x / (u_grainSize * 0.5f);
  float baseGrainSize = 1.0f;

  vec4 finalColor = vec4(0.0f, 0.0f, 0.0f, 0.0f);

  vec2 gridUV = (vUV + u_currentTileOffset) * gridSize;
  vec2 currentTile = floor(gridUV);

  for(int x = -4; x <= 4; x++) {
    for(int y = -4; y <= 4; y++) {
      vec2 tileOffset = vec2(float(x), float(y));
      vec2 targetTile = currentTile + tileOffset;

      uvec2 rand = pcg2d(uvec2(targetTile));
      uvec2 rand2 = pcg2d(rand);
      vec2 randNormalized = vec2(rand) * (1.0f / 4294967295.0f);
      vec2 rand2Normalized = vec2(rand2) * (1.0f / 4294967295.0f);

      vec2 grainCenter = targetTile + (randNormalized.xy - 0.5f) * GRAIN_SPREAD;
      vec2 textureUV = ((grainCenter + (rand2Normalized - 0.5f) * u_blurRadius) / gridSize - u_currentTileOffset + u_textureOverlapOffset) * u_textureOverlapScale;

      float size = baseGrainSize * ((randNormalized.x * 1.3f) + baseGrainSize);
      float dist = grainDistance(grainCenter, randNormalized, gridUV, aspectRatio);
      float mask = grainMask(size, dist);
      vec3 color = grainColor(size, dist);

      float exposure = grainExposure(textureUV, u_channel);

      float exposureThreshold = (randNormalized.x + randNormalized.y) * 0.5f;
      float grainActivation = step(exposureThreshold, curve(exposure, u_contrast, u_sensitivity));

      finalColor = vec4(mix(finalColor.rgb, color, grainActivation * mask * u_alpha), grainActivation * mask * u_alpha);
    }
  }
  outColor = finalColor;
}
