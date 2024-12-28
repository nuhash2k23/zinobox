export const fragment = `
  uniform sampler2D uDisplacement;
  uniform sampler2D uTexture;
  uniform vec2 winResolution;
  uniform float uTime;
  varying vec2 vUv;

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
    
    // Enhanced heat-like distortion
    float heatStrength = 0.15;
    vec2 displacedUV = uv;
    
    // Create more natural heat wave movement
    float heatWave = sin(displacement.r * 8.0 - uTime * 2.0) * 
                    cos(displacement.r * 4.0 - uTime * 1.5);
    
    displacedUV.x += displacement.r * heatStrength * heatWave;
    displacedUV.y += displacement.r * heatStrength * heatWave;

    // Add subtle turbulence
    float turbulence = sin(uv.y * 20.0 + uTime) * 0.002;
    displacedUV += turbulence * displacement.r;

    // Sample the background with distortion
    vec4 texture = texture2D(uTexture, displacedUV);
    
    // Create heat distortion intensity
    float distortionIntensity = displacement.r * 1.8;
    
    // Add subtle heat shimmer
    float shimmer = sin(displacement.r * 30.0 - uTime * 4.0) * 0.03 * displacement.r;
    
    // Create the heat haze effect
    vec4 finalColor = texture;
    finalColor.rgb += shimmer;
    
    // Add very subtle warm tint to distorted areas
    vec3 heatTint = vec3(1.02, 1.01, 1.0);
    finalColor.rgb *= mix(vec3(1.0), heatTint, distortionIntensity * 0.8);

    gl_FragColor = finalColor;
  }
`;