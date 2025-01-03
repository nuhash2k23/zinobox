// hooks/fragment.js
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
      vUv.x * ratio.x + (1.0 - ratio.x) ,
      vUv.y * ratio.y + (1.0 - ratio.y) 
    );

    vec4 displacement = texture2D(uDisplacement, uv);
    
    float heatStrength = 0.15;
    vec2 displacedUV = uv;
    
    float heatWave = sin(displacement.r * 8.0 - uTime * 1.5) * 
                    cos(displacement.r * 4.0 - uTime * 1.5);
    
    displacedUV.x += displacement.r * heatStrength * heatWave;
    displacedUV.y += displacement.r * heatStrength * heatWave;

    float turbulence = sin(uv.y * 20.0 + uTime) * 0.002;
    displacedUV += turbulence * displacement.r;

    vec4 texture = texture2D(uTexture, displacedUV);
    
    gl_FragColor = texture;
  }
`;