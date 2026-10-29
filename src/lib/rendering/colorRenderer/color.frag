#version 300 es

precision highp float;
precision highp int;
precision highp sampler2D;
precision highp sampler3D;

in vec2 vUV;
out vec4 outColor;

uniform sampler2D u_imageTexture;

uniform float u_temp;
uniform float u_tint;
uniform sampler3D u_lut;
uniform float u_lutFactor;

// https://docs.unity3d.com/Packages/com.unity.shadergraph@6.9/manual/White-Balance-Node.html
vec4 whiteBalance(in vec4 image) {
  // Range ~[-1.67;1.67] works best
  float t1 = u_temp * 10.0f / 6.0f;
  float t2 = u_tint * 10.0f / 6.0f;

  // Get the CIE xy chromaticity of the reference white point.
  // Note: 0.31271 = x value on the D65 white point
  float x = 0.31271f - t1 * (t1 < 0.0f ? 0.1f : 0.05f);
  float standardIlluminantY = 2.87f * x - 3.0f * x * x - 0.27509507f;
  float y = standardIlluminantY + t2 * 0.05f;

  // CIExyToLMS
  float Y = 1.0f;
  float X = Y * x / y;
  float Z = Y * (1.0f - x - y) / y;
  float L = 0.7328f * X + 0.4296f * Y - 0.1624f * Z;
  float M = -0.7036f * X + 1.6975f * Y + 0.0061f * Z;
  float S = 0.0030f * X + 0.0136f * Y + 0.9834f * Z;

  // Calculate the coefficients in the LMS space.
  const vec3 w = vec3(0.949237f, 1.03542f, 1.08728f); // D65 white point
  vec3 balance = w / vec3(L, M, S);

  const mat3 lin2lms_mat = mat3(3.90405e-1f, 5.49941e-1f, 8.92632e-3f, 7.08416e-2f, 9.63172e-1f, 1.35775e-3f, 2.31082e-2f, 1.28021e-1f, 9.36245e-1f);

  const mat3 lms2lin_mat = mat3(2.85847e+0f, -1.62879e+0f, -2.48910e-2f, -2.10182e-1f, 1.15820e+0f, 3.24281e-4f, -4.18120e-2f, -1.18169e-1f, 1.06867e+0f);

  vec3 lms = lin2lms_mat * image.rgb;
  lms *= balance;
  return vec4(lms2lin_mat * lms, image.a);
}

vec4 lut(in vec4 image) {
  vec3 lutColor = texture(u_lut, image.rgb).rgb;
  vec3 finalColor = mix(image.rgb, lutColor, u_lutFactor);
  return vec4(finalColor, image.a);
}

void main() {
  outColor = lut(whiteBalance(texture(u_imageTexture, vUV)));
}
