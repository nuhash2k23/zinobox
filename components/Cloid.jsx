import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, shaderMaterial, useTexture } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

// Create custom shader material using drei's shaderMaterial utility
const CloudMaterial = shaderMaterial(
  // Uniforms
  {
    uTime: 0,
    uShapeTexture: new THREE.Texture(),
    uNoiseTexture: new THREE.Texture(),
    uNoiseScale1: 4.0,
    uNoiseScale2: 8.0,
    uTimeScale1: 0.002,
    uTimeScale2: 0.003,
    uDisplacementStrength1: 0.1,
    uDisplacementStrength2: 0.05,
    uColor: new THREE.Color(1.0, 1.0, 1.0),
    uOpacity: 0.8,
    uCloudCoverage: 0.5,
    uCloudSharpness: 0.3
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float uTime;
    uniform sampler2D uShapeTexture;
    uniform sampler2D uNoiseTexture;
    uniform float uNoiseScale1;
    uniform float uNoiseScale2;
    uniform float uTimeScale1;
    uniform float uTimeScale2;
    uniform float uDisplacementStrength1;
    uniform float uDisplacementStrength2;
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uCloudCoverage;
    uniform float uCloudSharpness;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Improved noise function
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0.0,0.0)), 
                     hash(i + vec2(1.0,0.0)), u.x),
                 mix(hash(i + vec2(0.0,1.0)), 
                     hash(i + vec2(1.0,1.0)), u.x), u.y);
    }
    
    float fbm(vec2 p, float time) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for(int i = 0; i < 6; i++) {
        value += amplitude * noise(p * frequency + time * 0.05);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Create layered noise for more realistic clouds
      float noiseBig = fbm(uv * uNoiseScale1, uTime * uTimeScale1);
      float noiseMedium = fbm(uv * uNoiseScale2 * 0.5, uTime * uTimeScale2 * 1.5);
      float noiseSmall = fbm(uv * uNoiseScale2, uTime * uTimeScale2);
      
      // Combine noise layers for displacement
      vec2 displacement = vec2(
        noiseBig * uDisplacementStrength1 + noiseMedium * uDisplacementStrength2 * 0.5,
        noiseBig * uDisplacementStrength1 * 0.7 + noiseSmall * uDisplacementStrength2
      );
      
      vec2 finalUv = uv + displacement;
      
      // Sample textures with animated UV coordinates
      vec2 animUv1 = finalUv + vec2(uTime * 0.01, uTime * -0.005);
      vec2 animUv2 = finalUv + vec2(uTime * -0.008, uTime * 0.012);
      
      float noise1 = texture2D(uNoiseTexture, animUv1).r;
      float noise2 = texture2D(uNoiseTexture, animUv2).r;
      float shape = texture2D(uShapeTexture, finalUv).r;
      
      // Combine noises for cloud density
      float cloudNoise = (noise1 * 0.6 + noise2 * 0.4 + noiseMedium * 0.3);
      
      // Apply coverage and sharpness controls
      cloudNoise = smoothstep(uCloudCoverage, uCloudCoverage + uCloudSharpness, cloudNoise);
      
      // Final alpha calculation
      float alpha = cloudNoise * shape * uOpacity;
      
      // Add subtle color variation based on density
      vec3 finalColor = uColor + vec3(cloudNoise * 0.1);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);

// Extend the material so it can be used as a JSX component
extend({ CloudMaterial });

// Cloud mesh component
const CloudMesh = () => {
  const materialRef = useRef();
  const meshRef = useRef();

  // Create procedural textures using Three.js
  const noiseTexture = useMemo(() => {
    const size = 512;
    const data = new Uint8Array(size * size * 4);
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const stride = (i * size + j) * 4;
        
        // Multi-octave noise for better cloud texture
        let value = 0;
        let amplitude = 1;
        let frequency = 1;
        
        for (let octave = 0; octave < 4; octave++) {
          value += amplitude * Math.random();
          amplitude *= 0.5;
          frequency *= 2;
        }
        
        value = Math.min(255, Math.max(0, value * 128));
        
        data[stride] = value;
        data[stride + 1] = value;
        data[stride + 2] = value;
        data[stride + 3] = 255;
      }
    }
    
    const texture = new THREE.DataTexture(data, size, size);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
  }, []);

  const shapeTexture = useMemo(() => {
    const size = 512;
    const data = new Uint8Array(size * size * 4);
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const stride = (i * size + j) * 4;
        
        // Create multiple cloud shapes
        const centerX = size / 2;
        const centerY = size / 2;
        
        // Main cloud shape
        const dist1 = Math.sqrt((i - centerX) ** 2 + (j - centerY) ** 2);
        let value1 = Math.max(0, 1 - (dist1 / (size * 0.3)));
        
        // Secondary smaller clouds
        const dist2 = Math.sqrt((i - centerX * 0.7) ** 2 + (j - centerY * 1.3) ** 2);
        let value2 = Math.max(0, 1 - (dist2 / (size * 0.2)));
        
        const dist3 = Math.sqrt((i - centerX * 1.3) ** 2 + (j - centerY * 0.8) ** 2);
        let value3 = Math.max(0, 1 - (dist3 / (size * 0.15)));
        
        let finalValue = Math.max(value1, value2 * 0.7, value3 * 0.5) * 255;
        
        data[stride] = finalValue;
        data[stride + 1] = finalValue;
        data[stride + 2] = finalValue;
        data[stride + 3] = 255;
      }
    }
    
    const texture = new THREE.DataTexture(data, size, size);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Animation loop
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta;
    }
    
    // Gentle rotation for more dynamic clouds
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[6, 4, 64, 64]} />
      <cloudMaterial
        ref={materialRef}
        uShapeTexture={shapeTexture}
        uNoiseTexture={noiseTexture}
        transparent={true}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

// Background component with gradient sky
const SkyBackground = () => {
  const materialRef = useRef();

  const skyMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTopColor: { value: new THREE.Color(0.3, 0.6, 1.0) },
        uBottomColor: { value: new THREE.Color(0.8, 0.9, 1.0) },
        uSunColor: { value: new THREE.Color(1.0, 0.9, 0.7) },
        uSunPosition: { value: new THREE.Vector2(0.3, 0.7) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uTopColor;
        uniform vec3 uBottomColor;
        uniform vec3 uSunColor;
        uniform vec2 uSunPosition;
        varying vec2 vUv;
        
        void main() {
          // Sky gradient
          vec3 color = mix(uBottomColor, uTopColor, vUv.y);
          
          // Add sun glow
          float sunDist = distance(vUv, uSunPosition);
          float sunGlow = 1.0 - smoothstep(0.0, 0.3, sunDist);
          color = mix(color, uSunColor, sunGlow * 0.3);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `
    });
  }, []);

  return (
    <mesh position={[0, 0, -10]} material={skyMaterial}>
      <planeGeometry args={[50, 50]} />
    </mesh>
  );
};

// Main component
const CloudComponent = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
      >
        <SkyBackground />
        <CloudMesh />
        
        {/* Optional: Add multiple cloud layers */}
        <CloudMesh />
        <mesh position={[-3, 1, -2]} scale={[0.8, 0.8, 1]}>
          <planeGeometry args={[6, 4, 64, 64]} />
          <cloudMaterial
            uShapeTexture={new THREE.DataTexture()}
            uNoiseTexture={new THREE.DataTexture()}
            uOpacity={0.6}
            uTimeScale1={0.001}
            uTimeScale2={0.0025}
            transparent={true}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      </Canvas>
      
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        background: 'rgba(0,0,0,0.6)',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>🌤️ Advanced Cloud System</h3>
        <div>✨ Multi-layer procedural clouds</div>
        <div>🌀 Real-time noise animation</div>
        <div>🎮 Interactive camera controls</div>
        <div>🎨 Custom shader materials</div>
        <br />
        <small>
          To use your textures:<br />
          Replace procedural textures with:<br />
          <code>useTexture(&apos;/shape.png&apos;)</code><br />
          <code>useTexture(&apos;/noise.png&apos;)</code>
        </small>
      </div>
    </div>
  );
};

export default CloudComponent;