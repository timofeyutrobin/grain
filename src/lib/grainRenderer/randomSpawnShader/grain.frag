#version 300 es

precision highp float;
precision highp sampler2D;

in vec2 vUV;
out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_contrast;
uniform float u_sensitivity;
uniform float u_grainSize;
uniform float u_alpha;

uniform sampler2D u_imageTexture;

uvec2 pcg2d(uvec2 v) {
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

void main() {
  float aspectRatio = u_resolution.x / u_resolution.y;
  float gridSize = u_resolution.x / (u_grainSize * 0.5f);
  float localGrainSize = 0.5f;
  int spawnRate = 3;

  vec4 finalColor = vec4(0.0f, 0.0f, 0.0f, 1.0f);
  vec3 grainColor = vec3(0.85f, 0.85f, 0.85f);

  vec2 gridUV = vUV * gridSize;
  vec2 currentCell = floor(gridUV);

  for(int x = -3; x <= 3; x++) {
    for(int y = -3; y <= 3; y++) {
      for(int i = 0; i < spawnRate; i++) {
        vec2 cellOffset = vec2(float(x), float(y));
        vec2 targetCell = currentCell + cellOffset;

        vec2 rand = vec2(pcg2d(uvec2(targetCell + float(i) * gridSize))) / float(uint(0xffffffff));

        vec2 absoluteGrainCenter = targetCell + (rand.xy - 0.5f) * 2.0f;
        vec2 textureUV = absoluteGrainCenter / gridSize;

        float currentGrainSize = localGrainSize * (rand.x * 3.0f) + localGrainSize;
        vec2 pos = gridUV - absoluteGrainCenter;
        float dist = length(vec2(pos.x * aspectRatio, pos.y));

        vec4 image = textureLod(u_imageTexture, textureUV, 0.0f);
        float exposure = 0.299f * image.r + 0.587f * image.g + 0.114f * image.b;

        float exposureThreshold = (rand.x + rand.y) * 0.5f;
        float mask = smoothstep(currentGrainSize, currentGrainSize - 0.5f, dist);

        float coreDensity = smoothstep(currentGrainSize * 1.2f, 0.0f, dist);
        vec3 currentGrainIntensity = grainColor * (0.7f + coreDensity * 0.3f);

        float grainActivation = step(exposureThreshold, curve(exposure, u_contrast, u_sensitivity));

        finalColor.rgb = mix(finalColor.rgb, currentGrainIntensity, grainActivation * mask * u_alpha);
      }
    }
  }
  outColor = finalColor;
}
