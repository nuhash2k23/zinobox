// hooks/fragment.js
export const fragment = `
  uniform sampler2D uDisplacement;
  uniform sampler2D uTexture;
  uniform vec2 winResolution;
  uniform float uTime;
  varying vec2 vUv;

  // Noise function for organic movement
  float noise(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // Smooth noise for flowing effects
  float smoothNoise(vec2 uv) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Fractal noise for more complex patterns
  float fractalNoise(vec2 uv) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 4; i++) {
      value += amplitude * smoothNoise(uv * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    
    return value;
  }

  // Aurora color palette
  vec3 auroraColor(float t, float intensity) {
    vec3 color1 = vec3(0.1, 0.8, 0.4);  // Green
    vec3 color2 = vec3(0.2, 0.4, 0.9);  // Blue
    vec3 color3 = vec3(0.8, 0.2, 0.8);  // Purple/Pink
    vec3 color4 = vec3(0.1, 0.9, 0.8);  // Cyan
    
    // Cycle through colors based on time and position
    float colorPhase = fract(t * 0.5 + intensity);
    
    vec3 finalColor;
    if(colorPhase < 0.25) {
      finalColor = mix(color1, color2, colorPhase * 4.0);
    } else if(colorPhase < 0.5) {
      finalColor = mix(color2, color3, (colorPhase - 0.25) * 4.0);
    } else if(colorPhase < 0.75) {
      finalColor = mix(color3, color4, (colorPhase - 0.5) * 4.0);
    } else {
      finalColor = mix(color4, color1, (colorPhase - 0.75) * 4.0);
    }
    
    return finalColor;
  }

  void main() {
    vec2 ratio = vec2(
      min((winResolution.x / winResolution.y) / (16.0 / 9.0), 1.0),
      min((winResolution.y / winResolution.x) / (9.0 / 16.0), 1.0)
    );

    vec2 uv = vec2(
      vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    vec4 displacement = texture2D(uDisplacement, uv);
    
    // Create flowing aurora patterns
    vec2 flowUV = uv + uTime * 0.1;
    
    // Multiple layers of flowing noise for aurora effect
    float noise1 = fractalNoise(flowUV * 3.0 + vec2(uTime * 0.2, uTime * 0.15));
    float noise2 = fractalNoise(flowUV * 5.0 - vec2(uTime * 0.3, uTime * 0.1));
    float noise3 = fractalNoise(flowUV * 8.0 + vec2(uTime * 0.1, uTime * 0.4));
    
    // Combine noise layers
    float combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
    
    // Create aurora waves that flow vertically
    float auroraWave1 = sin(uv.y * 15.0 + uTime * 2.0 + combinedNoise * 5.0) * 0.5 + 0.5;
    float auroraWave2 = sin(uv.y * 8.0 - uTime * 1.5 + noise2 * 3.0) * 0.5 + 0.5;
    float auroraWave3 = sin(uv.y * 12.0 + uTime * 1.8 + noise3 * 4.0) * 0.5 + 0.5;
    
    // Combine waves
    float auroraIntensity = (auroraWave1 + auroraWave2 + auroraWave3) / 3.0;
    
    // Add displacement influence
    auroraIntensity += displacement.r * 2.0;
    
    // Create dust particle effect
    float dustPattern = fractalNoise(uv * 25.0 + uTime * 0.5);
    float dustIntensity = smoothstep(0.6, 1.0, dustPattern) * 0.8;
    
    // Flowing displacement effect
    vec2 flowDisplacement = vec2(
      sin(uv.y * 10.0 + uTime + combinedNoise * 2.0) * 0.03,
      cos(uv.x * 8.0 + uTime * 0.8 + noise2 * 3.0) * 0.02
    );
    
    // Apply displacement with aurora influence
    vec2 displacedUV = uv + flowDisplacement * displacement.r * auroraIntensity;
    
    // Get the original video texture
    vec4 originalTexture = texture2D(uTexture, displacedUV);
    
    // Create aurora colors
    vec3 aurora = auroraColor(uTime + combinedNoise, auroraIntensity);
    
    // Create final aurora effect
    float auroraStrength = displacement.r * auroraIntensity * 0.8;
    auroraStrength += dustIntensity * 0.6;
    
    // Blend aurora with original video
    vec3 finalColor = mix(
      originalTexture.rgb,
      originalTexture.rgb + aurora * auroraStrength,
      smoothstep(0.1, 0.9, auroraStrength)
    );
    
    // Add some atmospheric glow
    float glow = smoothstep(0.3, 1.0, auroraIntensity) * 0.3;
    finalColor += aurora * glow * displacement.r;
    
    gl_FragColor = vec4(finalColor, originalTexture.a);
  }
`;