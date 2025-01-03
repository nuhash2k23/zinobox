import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {  OrbitControls, useGLTF, Stage } from '@react-three/drei';
import * as THREE from 'three';
import Image from 'next/image';


const Icons = {
    orbit: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    pan: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 9L2 12M2 12L5 15M2 12H22M15 5L12 2M12 2L9 5M12 2V22M15 19L12 22M12 22L9 19M19 9L22 12M22 12L19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    zoom: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M10 7V13M7 10H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    layers: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 12L11.7317 16.8649C11.9006 16.9534 12.0994 16.9534 12.2683 16.8649L22 12M2 17L11.7317 21.8649C11.9006 21.9534 12.0994 21.9534 12.2683 21.8649L22 17M2 7L11.7317 2.13505C11.9006 2.04663 12.0994 2.04663 12.2683 2.13505L22 7L12.2683 11.8649C12.0994 11.9534 11.9006 11.9534 11.7317 11.8649L2 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    close: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  };


  const MenuButton = ({ onClick, isOpen }) => (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        right: '20px',
        top: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 16px',
        cursor: 'pointer',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isOpen ? 'translateX(calc(100% + 320px))' : 'translateX(0)',
        opacity: isOpen ? 0 : 1,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transform: `scale(${isOpen ? 0.8 : 1})`,
        transition: 'transform 0.3s ease'
      }}>
        {Icons.layers}
        <span style={{ 
          fontSize: '14px',
          fontWeight: '500',
          letterSpacing: '0.5px'
        }}>Layers</span>
      </div>
    </button>
  );
  

const Hotspot = ({ position, onClick, label }) => {
    const [hovered, setHovered] = useState(false);
    const { camera } = useThree();
    const billboardRef = useRef();
  
    useFrame(() => {
      if (billboardRef.current) {
        billboardRef.current.lookAt(camera.position);
      }
    });
  
    return (
      <group position={position}>
        <group ref={billboardRef}>
          <mesh
            onClick={onClick}
            onPointerDown={onClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            <circleGeometry args={[0.83, 32]} />
            <meshBasicMaterial
              color={hovered ? "#ff4444" : "#ffffff"}
              transparent
              opacity={1.0}
            />
          </mesh>
          <sprite
            position={[0, 3.95, 0]}
            scale={[12, 6, 12]}
          >
            <spriteMaterial
              transparent
              opacity={hovered ? 1 : 0.8}
            >
              <canvasTexture
                attach="map"
                image={(() => {
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  canvas.width = 256;
                  canvas.height = 128;
                  ctx.fillStyle = '#000000';
                  ctx.fillRect(0, 0, 256, 128);
                  ctx.fillStyle = '#ffffff';
                  ctx.font = '24px Arial';
                  ctx.textAlign = 'center';
                  ctx.fillText(label, 128, 64);
                  return canvas;
                })()}
              />
            </spriteMaterial>
          </sprite>
        </group>
      </group>
    );
  };
  const HotspotsContainer = ({ setSelectedHotspot }) => {
    const hotspots = [
      {
        id: 1,
        position: [0.81, 30, 51.684],
        label: "Road Damage",
        description: "Severe cracks and damage seen on the road",
        image: "/road.png"
      },
      {
        id: 2,
        position: [-20, 20, 84],
        label: "Bridge Moss",
        description: "Deep moss of green and black forming in the bridge surface",
        image: "/bridge.png"
      },
      {
        id: 3,
        position: [-15, 32, 90],
        label: "Fence Rust",
        description: "Fence showing rust signs of deterioration",
        image: "/fence.png"
      },
      // Add more hotspots as needed
    ];
  
    return (
      <>
        {hotspots.map((hotspot) => (
          <Hotspot
            key={hotspot.id}
            position={hotspot.position}
            label={hotspot.label}
            onClick={() => setSelectedHotspot(hotspot)}
          />
        ))}
      </>
    );
  };
export const GlowShader = {
    uniforms: {
        tDiffuse: { value: null },
        glowColor: { value: new THREE.Color(1, 1, 0.7) },
        glowIntensity: { value: 1.0 },
        isOn: { value: 1.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 glowColor;
        uniform float glowIntensity;
        uniform float isOn;
        varying vec2 vUv;

        void main() {
            float strength = distance(vUv, vec2(0.5));
            strength = 1.0 - strength;
            strength = pow(strength, 3.0);

            vec3 glow = glowColor * strength * glowIntensity * isOn;
            gl_FragColor = vec4(glow, 1.0);
        }
    `
};

export const RoadCrackShader = {
    uniforms: {
        baseTexture: { value: null },
        crackAmount: { value: 0.0 },
        noiseScale: { value: 2.0 },
        crackDepth: { value: 0.15 },
        crackWidth: { value: 0.8 }
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform float crackAmount;
        uniform float crackDepth;

        // Improved noise function for more natural-looking cracks
        float hash(vec2 p) {
            p = fract(p * vec2(234.34, 435.345));
            p += dot(p, p + 34.23);
            return fract(p.x * p.y);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            
            return mix(
                mix(a, b, f.x),
                mix(c, d, f.x),
                f.y
            );
        }

        float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 1.0;
            for(int i = 0; i < 6; i++) {
                value += amplitude * noise(p * frequency);
                frequency *= 2.0;
                amplitude *= 0.5;
            }
            return value;
        }

        void main() {
            vUv = uv;
            vNormal = normal;
            
            // Calculate displacement
            vec2 noiseCoord = uv * 10.0;
            float crack = fbm(noiseCoord);
            float displacement = 0.0;
            
            // Create sharp cracks
            float crackThreshold = 1.0 - crackAmount * 0.5;
            if (crack > crackThreshold) {
                displacement = (crack - crackThreshold) * crackDepth * crackAmount;
            }
            
            // Apply displacement along normal
            vec3 newPosition = position - normal * displacement;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D baseTexture;
        uniform float crackAmount;
        uniform float crackWidth;
        uniform float noiseScale;
        
        varying vec2 vUv;
        varying vec3 vNormal;

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
                f.y
            );
        }

        float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 1.0;
            for(int i = 0; i < 6; i++) {
                value += amplitude * noise(p * frequency);
                frequency *= 2.0;
                amplitude *= 0.5;
            }
            return value;
        }

        void main() {
            vec4 baseColor = texture2D(baseTexture, vUv);
            
            // Generate crack pattern
            vec2 noiseCoord = vUv * noiseScale * 10.0;
            float crack = fbm(noiseCoord);
            
            // Create sharp cracks with darker edges
            float crackThreshold = 1.0 - crackAmount * 0.5;
            float crackEdge = smoothstep(crackThreshold - 0.02, crackThreshold, crack);
            
            // Darken the cracks
            vec3 crackColor = vec3(0.2, 0.2, 0.2);
            vec3 edgeColor = vec3(0.3, 0.3, 0.3);
            
            // Mix colors based on crack pattern
            vec3 finalColor = baseColor.rgb;
            if (crack > crackThreshold) {
                finalColor = mix(crackColor, baseColor.rgb, 0.2);
            } else if (crack > crackThreshold - 0.05) {
                finalColor = mix(edgeColor, baseColor.rgb, crackEdge);
            }
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
};

// Rust Shader for Fence
export const RustShaderFence = {
    uniforms: {
        baseTexture: { value: null },
        rustAmount: { value: 0.0 },
        noiseScale: { value: 4.0 },
        metalness: { value: .8 },
        roughness: { value: .2 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D baseTexture;
        uniform float rustAmount;
        uniform float noiseScale;
        uniform float metalness;
        uniform float roughness;
        varying vec2 vUv;

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            
            return mix(
                mix(a, b, f.x),
                mix(c, d, f.x),
                f.y
            );
        }

        float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 1.0;
            for(int i = 0; i < 8; i++) {
                value += amplitude * noise(p * frequency);
                frequency *= 2.2;
                amplitude *= 0.6;
            }
            return value;
        }

        void main() {
            vec4 baseColor = texture2D(baseTexture, vUv);
        
            float uniqueSeed = 0.7;
            vec2 uv = vUv * noiseScale + uniqueSeed;
            
            float n1 = fbm(uv * 2.0);
            float n2 = fbm(uv * 4.0 + vec2(5.2, 1.3));
            float n3 = fbm(uv * 8.0 + vec2(9.4, 2.6));
            
            float rustPattern = (n1 * 0.6 + n2 * 0.25 + n3 * 0.15) * 1.8;
            rustPattern = pow(rustPattern, 0.65);
            
            vec4 darkRust = vec4(0.52, 0.28, 0.12, 0.8);
            vec4 midRust = vec4(0.58, 0.32, 0.15, 0.5);
            vec4 lightRust = vec4(0.65, 0.38, 0.18, 0.3);
            
            float threshold = smoothstep(0.3, 0.9, rustAmount);
            float adjustedPattern = mix(rustPattern, 1.0, threshold);
            
            vec4 rustMix = mix(
                darkRust,
                mix(midRust, lightRust, n2),
                n1 * n3 * 0.8
            );
            
            float finalMix = rustAmount * adjustedPattern;
            finalMix = mix(finalMix, 1.0, pow(rustAmount, 0.5));
            
            vec4 finalColor = baseColor;
            finalColor.rgb = mix(
                baseColor.rgb, 
                rustMix.rgb, 
                finalMix * rustMix.a
            );
            
            finalColor.a = baseColor.a;
            
            finalColor.rgb = mix(finalColor.rgb, finalColor.rgb * (1.0 - roughness), metalness);
            
            gl_FragColor = finalColor;
        }
    `
};

// Moss Shader for Pillars
export const MossShaderPillar = {
    uniforms: {
        baseTexture: { value: null },
        mossAmount: { value: 0.0 },
        noiseScale: { value: 12.0 },
        metalness: { value: 0.6 },
        roughness: { value: 0.8 }
    },
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D baseTexture;
        uniform float mossAmount;
        uniform float noiseScale;
        uniform float metalness;
        uniform float roughness;
        varying vec2 vUv;
        varying vec3 vPosition;

        float hash(vec2 p) {
            p = fract(p * vec2(443.897, 441.423));
            p += dot(p, p + 19.19);
            return fract(p.x * p.y);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
                f.y
            );
        }

        float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 1.0;
            for(int i = 0; i < 6; i++) {
                value += amplitude * noise(p * frequency);
                frequency *= 2.0;
                amplitude *= 0.5;
            }
            return value;
        }

        void main() {
            vec4 baseColor = texture2D(baseTexture, vUv);
            
            vec2 uv = vUv * noiseScale;
            float n1 = fbm(uv * 2.0);
            float n2 = fbm(uv * 3.0 + vec2(2.1, 4.3));
            float n3 = fbm(uv * 4.0 + vec2(6.4, 1.6));
            
            float mossPattern = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2) * 1.8;
            mossPattern = pow(mossPattern, 0.8);
            
            vec4 darkMoss = vec4(0.15, 0.35, 0.15, 0.9);
            vec4 midMoss = vec4(0.25, 0.45, 0.20, 0.7);
            vec4 lightMoss = vec4(0.35, 0.55, 0.25, 0.5);
            
            float heightFactor = clamp(vPosition.y * 0.1, 0.0, 1.0);
            float threshold = 1.0 - (mossAmount * 2.0 * heightFactor);
            float adjustedPattern = smoothstep(threshold, 1.0, mossPattern);
            
            vec4 mossMix = mix(
                darkMoss,
                mix(midMoss, lightMoss, n2),
                n1 * n3
            );
            
            float finalMix = mossAmount * adjustedPattern;
            finalMix = pow(finalMix, 1.2);
            
            vec4 finalColor = baseColor;
            finalColor.rgb = mix(
                baseColor.rgb, 
                mossMix.rgb, 
                finalMix * mossMix.a
            );
            
            finalColor.a = baseColor.a;
            
            finalColor.rgb = mix(finalColor.rgb, finalColor.rgb * (1.0 - roughness), metalness);
            
            gl_FragColor = finalColor;
        }
    `
};

function Model({ year, setSelectedHotspot  }) {
    const { nodes, materials } = useGLTF('/Bridge.glb');
    const fenceMaterialRef = useRef();
    const pillarMaterialRef = useRef();
    const roadMaterialRef = useRef();
    const lightMaterialRef = useRef();
    const lightStates = useRef([]);

    useEffect(() => {
        lightStates.current = Array(10).fill(1);
        
        if (materials) {

            const createGlowMaterial = () => {
                const material = new THREE.ShaderMaterial({
                    uniforms: {
                        glowColor: { value: new THREE.Color(1, 1, 0.7) },
                        glowIntensity: { value: 1.0 },
                        isOn: { value: 1.0 }
                    },
                    vertexShader: GlowShader.vertexShader,
                    fragmentShader: GlowShader.fragmentShader,
                    transparent: true,
                    blending: THREE.AdditiveBlending
                });
                return material;
            };

            lightMaterialRef.current = createGlowMaterial();
        
            // Create Rust Material (for fence)
            const createRustMaterial = (baseMaterial) => {
                const material = new THREE.MeshPhysicalMaterial({
                    map: baseMaterial.map,
                    metalness: 0.91,
                    roughness: 0.42,
                    clearcoat: 0.0,
                    clearcoatRoughness: 0.0,
                    transparent: true,
                    opacity: 1,
                });

                material.onBeforeCompile = (shader) => {
                    shader.uniforms.rustAmount = { value: 0.0 };
                    shader.uniforms.noiseScale = { value: 0.15 };
                    shader.uniforms.baseTexture = { value: baseMaterial.map };

                    shader.vertexShader = shader.vertexShader.replace(
                        '#include <common>',
                        `
                        #include <common>
                        varying vec2 vUvRust;
                        `
                    );

                    shader.vertexShader = shader.vertexShader.replace(
                        '#include <begin_vertex>',
                        `
                        #include <begin_vertex>
                        vUvRust = uv;
                        `
                    );

                    shader.fragmentShader = shader.fragmentShader.replace(
                        '#include <common>',
                        `
                        #include <common>
                        uniform float rustAmount;
                        uniform float noiseScale;
                        uniform sampler2D baseTexture;
                        varying vec2 vUvRust;

                        float hash(vec2 p) {
                            p = fract(p * vec2(234.34, 435.345));
                            p += dot(p, p + 34.23);
                            return fract(p.x * p.y);
                        }

                        float noise(vec2 p) {
                            vec2 i = floor(p);
                            vec2 f = fract(p);
                            float a = hash(i);
                            float b = hash(i + vec2(1.0, 0.0));
                            float c = hash(i + vec2(0.0, 1.0));
                            float d = hash(i + vec2(1.0, 1.0));
                            f = f * f * (3.0 - 2.0 * f);
                            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
                        }

                        float fbm(vec2 p) {
                            float value = -0.30;
                            float amplitude = 0.65;
                float frequency = 0.20;
                            for(int i = 0; i < 8; i++) {
                                value += amplitude * noise(p * frequency);
                                frequency *= 6.82;
                                amplitude *= 0.56;
                            }
                            return value;
                        }
                        `
                    );

                    shader.fragmentShader = shader.fragmentShader.replace(
                        '#include <color_fragment>',
                        `
                        #include <color_fragment>
                        
                        vec2 uv = vUvRust * noiseScale;
                        float n1 = fbm(uv * 2.0);
                        float n2 = fbm(uv * 4.0 + vec2(5.2, 1.3));
                        float n3 = fbm(uv * 8.0 + vec2(9.4, 2.6));
                        
                        float rustPattern = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2) * 6.5;
                        rustPattern = pow(rustPattern, 0.7);
                        
                  vec4 darkRust = vec4(0.32, 0.18, 0.08, 1.0);    // Much darker brown
vec4 midRust = vec4(0.0,0.0,0.0, 0.30);    // Darker mid toneA
vec4 lightRust = vec4(0.45, 0.28, 0.14, 0.14);  // Darker light tone
                        
                        float threshold = 1.0 - (rustAmount * 2.0);
                        float adjustedPattern = smoothstep(threshold, 1.0, rustPattern);
                        
                        vec4 rustMix = mix(
                            darkRust,
                            mix(midRust, lightRust, n2),
                            n1 * n3
                        );
                        
                        float finalMix = rustAmount * adjustedPattern;
                        finalMix = pow(finalMix, .5);
                        
                        vec4 baseColor = vec4(diffuseColor.rgb, diffuseColor.a);
                        diffuseColor = mix(baseColor, rustMix, finalMix * rustMix.a);
                        diffuseColor.a = baseColor.a;
                        `
                    );

                    material.userData.shader = shader;
                };

                return material;
            };
const createRoadMaterial = (baseMaterial) => {
    const material = new THREE.ShaderMaterial({
        uniforms: {
            baseTexture: { value: baseMaterial.map },
            crackAmount: { value: 0.0 },
            noiseScale: { value: 2.0 },
            crackDepth: { value: 0.15 },
            crackWidth: { value: 0.08 }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying float vDisplacement;
            uniform float crackAmount;
            uniform float crackDepth;
            uniform float noiseScale;

            float hash(vec2 p) {
                p = fract(p * vec2(234.34, 435.345));
                p += dot(p, p + 34.23);
                return fract(p.x * p.y);
            }

            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                
                return mix(
                    mix(a, b, f.x),
                    mix(c, d, f.x),
                    f.y
                );
            }

            float fbm(vec2 p) {
                float value = 0.10;
                float amplitude = 0.5;
                float frequency = 1.0;
                for(int i = 0; i < 6; i++) {
                    value += amplitude * noise(p * frequency);
                    frequency *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main() {
                vUv = uv;
                vNormal = normal;
                
                // Enhanced crack pattern
                vec2 noiseCoord = uv * noiseScale * 5.0;
                float crack = fbm(noiseCoord);
                float crackPattern = smoothstep(0.4, 0.6, crack);
                
                // Calculate displacement
                float displacement = 0.0;
                float crackThreshold = 1.0 - crackAmount * 0.5;
                
                if (crack > crackThreshold) {
                    // Enhanced displacement calculation
                    float crackStrength = (crack - crackThreshold) / (1.0 - crackThreshold);
                    displacement = crackStrength * crackDepth * crackAmount * 2.0;
                    
                    // Add variation to displacement
                    displacement *= (1.0 + fbm(noiseCoord * 2.0) * 0.5);
                }
                
                vDisplacement = displacement;
                
                // Apply displacement along normal and add some random offset
                vec3 newPosition = position - normal * displacement * 0.95;
                newPosition += normal * fbm(noiseCoord * 13.0) * displacement * 0.42;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D baseTexture;
            uniform float crackAmount;
            uniform float crackWidth;
            uniform float noiseScale;
            
            varying vec2 vUv;
            varying vec3 vNormal;
            varying float vDisplacement;

            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 758.5453123);
            }

            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                return mix(
                    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
                    f.y
                );
            }

            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.80;
                for(int i = 0; i < 6; i++) {
                    value += amplitude * noise(p * frequency);
                    frequency *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main() {
                vec4 baseColor = texture2D(baseTexture, vUv);
                
                // Enhanced crack pattern
                vec2 noiseCoord = vUv * noiseScale * 5.0;
                float crack = fbm(noiseCoord);
                
                // Calculate crack edges
                float crackThreshold = 0.9 - crackAmount * 0.34;
                float edgeWidth = 0.1 * crackAmount;
                float innerCrack = smoothstep(crackThreshold - edgeWidth, crackThreshold, crack);
                float outerCrack = smoothstep(crackThreshold, crackThreshold + edgeWidth, crack);
                
                // Create sharp black edges
                vec3 crackColor = vec3(0.0, 0.0, 0.0);  // Pure black
                vec3 edgeColor = vec3(0.07, 0.07, 0.07);   // Very dark grey
                
                // Mix colors based on crack pattern
                vec3 finalColor = baseColor.rgb;
                
                // Apply edge coloring
                if (crack > crackThreshold) {
                    // Inner part of crack
                    finalColor = mix(crackColor, edgeColor, outerCrack);
                } else if (crack > crackThreshold - edgeWidth) {
                    // Edge of crack
                    finalColor = mix(baseColor.rgb, crackColor, innerCrack);
                }
                
                // Add depth shading based on displacement
                float shadowIntensity = vDisplacement * 2.0;
                finalColor = mix(finalColor, crackColor, shadowIntensity);
                
                // Add some ambient occlusion effect
                float ao = 4.0 - (vDisplacement * 1.05);
                finalColor *= ao;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        transparent: true
    });
    return material;
};
          // In your Model component, modify the createMossMaterial function:

const createMossMaterial = (baseMaterial) => {
    const material = new THREE.MeshPhysicalMaterial({
        map: baseMaterial.map,
        metalness: 0.01,
        roughness: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 1.0,
        transparent: true,
        opacity: 1,
    });

    material.onBeforeCompile = (shader) => {
        shader.uniforms.rustAmount = { value: 0.0 };  // We'll use rustAmount for consistency
        shader.uniforms.noiseScale = { value: 2.0 };
        shader.uniforms.baseTexture = { value: baseMaterial.map };

        shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `
            #include <common>
            varying vec2 vUvRust;
            `
        );

        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            #include <begin_vertex>
            vUvRust = uv;
            `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            `
            #include <common>
            uniform float rustAmount;
            uniform float noiseScale;
            uniform sampler2D baseTexture;
            varying vec2 vUvRust;

            float hash(vec2 p) {
                p = fract(p * vec2(234.34, 435.345));
                p += dot(p, p + 34.23);
                return fract(p.x * p.y);
            }

            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                f = f * f * (3.0 - 2.0 * f);
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.65;
                float frequency = 0.20;
                for(int i = 0; i < 8; i++) {
                    value += amplitude * noise(p * frequency);
                    frequency *= 2.2;
                    amplitude *= 0.6;
                }
                return value;
            }
            `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <color_fragment>',
            `
            #include <color_fragment>
            
            vec2 uv = vUvRust * noiseScale;
            float n1 = fbm(uv * 2.0);
            float n2 = fbm(uv * 4.0 + vec2(5.2, 1.3));
            float n3 = fbm(uv * 8.0 + vec2(9.4, 2.6));
            
            float rustPattern = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2) * 1.5;
            rustPattern = pow(rustPattern, 0.7);
            
            // Different colors for pillar
      vec4 darkColor = vec4(0.05, 0.08, 0.04, 1.0);    // Very dark moss green, almost black
vec4 midColor = vec4(0.08, 0.12, 0.06, 0.0005);     // Dark murky green
vec4 lightColor = vec4(0.0,0.0,0.0, 1.0);   // Slightly lighter but still very dark green

            
            float threshold = 1.0 - (rustAmount * 2.0);
            float adjustedPattern = smoothstep(threshold, 1.0, rustPattern);
            
            vec4 colorMix = mix(
                darkColor,
                mix(midColor, lightColor, n2),
                n1 * n3
            );
            
            float finalMix = rustAmount * adjustedPattern;
            finalMix = pow(finalMix, 1.5);
            
            vec4 baseColor = vec4(diffuseColor.rgb, diffuseColor.a);
            diffuseColor = mix(baseColor, colorMix, finalMix * colorMix.a);
            diffuseColor.a = baseColor.a;
            `
        );

        material.userData.shader = shader;
    };

    return material;
};

            // Create materials
            fenceMaterialRef.current = createRustMaterial(materials['Material.002']);
            pillarMaterialRef.current = createMossMaterial(materials['Scene_-_Root']);
            roadMaterialRef.current = createRoadMaterial(materials['road_road_0016_01_tiled.001']);
        }
    }, [materials]);

    useFrame(() => {
        const rustAmount = (year - 2000) / 20;
        if (lightMaterialRef.current) {
            // Probability of light failure increases with time
            const failureChance = rustAmount * 0.1;
            
            lightStates.current = lightStates.current.map((state, index) => {
                if (state === 1 && Math.random() < failureChance) {
                    return 0; // Turn off the light
                }
                return state;
            });

            // Update light intensity
            const flickerAmount = Math.random() * 0.2 + 0.8;
            lightMaterialRef.current.uniforms.glowIntensity.value = flickerAmount;
            
            // Random flickering for working lights
            lightStates.current.forEach((state, index) => {
                if (state === 1 && Math.random() < 0.1) {
                    lightMaterialRef.current.uniforms.isOn.value = 
                        Math.random() < 0.9 ? 1.0 : 0.0;
                }
            });
        }
        if (fenceMaterialRef.current?.userData.shader) {
            fenceMaterialRef.current.userData.shader.uniforms.rustAmount.value = rustAmount;
        }
        if (pillarMaterialRef.current?.userData.shader) {
            pillarMaterialRef.current.userData.shader.uniforms.rustAmount.value = rustAmount;
        }
        if (roadMaterialRef.current) {
            roadMaterialRef.current.uniforms.crackAmount.value = rustAmount;
        }
    });

    return (
        <group dispose={null} scale={0.5}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.lightstand.geometry}
                material={materials.Material}
                position={[-13.003, 0, -281.684]}
                rotation={[-Math.PI / 2, 0.008, -Math.PI / 2]}
                scale={0.001}
            />
                 <HotspotsContainer setSelectedHotspot={setSelectedHotspot} />
       <mesh
                castShadow
                receiveShadow
                geometry={nodes.road.geometry}
                material={roadMaterialRef.current || materials['road_road_0016_01_tiled.001']}
                position={[-13.003, 0, -281.684]}
                rotation={[-Math.PI / 2, 0.008, -Math.PI / 2]}
                scale={0.001}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.fence.geometry}
                material={fenceMaterialRef.current || materials['Material.002']}
                position={[-13.003, 0, -281.684]}
                rotation={[-Math.PI / 2, 0.008, -Math.PI / 2]}
                scale={0.001}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.rectpillar.geometry}
                material={pillarMaterialRef.current || materials['Scene_-_Root']}
                position={[-13.003, 0, -281.684]}
                rotation={[-Math.PI / 2, 0.008, -Math.PI / 2]}
                scale={0.001}
            />
        <mesh
                castShadow
                receiveShadow
                geometry={nodes.light.geometry}
                material={lightMaterialRef.current || materials['Material.001']}
                position={[-13.003, 0, -281.684]}
                rotation={[-Math.PI / 2, 0.008, -Math.PI / 2]}
                scale={0.001}
            >
                {/* Add point light for extra glow */}
                <pointLight
                    color="#ffeecc"
                    intensity={1}
                    distance={5}
                    decay={2}
                    castShadow
                />
            </mesh>
        </group>
    );
}

const ControlPanel = ({ setControlMode, controlMode }) => {
    const buttonStyle = (mode) => ({
      padding: '12px',
      background: controlMode === mode 
        ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
        : 'rgba(255, 255, 255, 0.1)',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      boxShadow: controlMode === mode 
        ? '0 4px 15px rgba(76, 175, 80, 0.3)'
        : 'none',
      transform: controlMode === mode 
        ? 'scale(1.05)'
        : 'scale(1)',
      ':hover': {
        background: controlMode === mode 
          ? 'linear-gradient(135deg, #45a049 0%, #409444 100%)'
          : 'rgba(255, 255, 255, 0.15)'
      }
    });
  
    return (
      <div style={{
        position: 'absolute',
        left: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '12px',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
      }}>
        {[
          { mode: 'orbit', icon: Icons.orbit, label: 'Orbit' },
          { mode: 'pan', icon: Icons.pan, label: 'Pan' },
          { mode: 'zoom', icon: Icons.zoom, label: 'Zoom' }
        ].map(({ mode, icon, label }) => (
          <button 
            key={mode}
            onClick={() => setControlMode(mode)}
            style={buttonStyle(mode)}
          >
            {icon}
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              letterSpacing: '0.5px'
            }}>{label}</span>
          </button>
        ))}
      </div>
    );
  };
  const getConditionDescription = (year) => {
    const age = year - 2000;
    if (age <= 5) {
      return {
        Corrosion: "Minor surface oxidation",
        Crack: "Hairline cracks visible",
        Debris: "Minimal accumulation",
        "Exposed Rebar": "No exposure visible",
        Spalling: "Surface intact",
        overall: "Good structural condition"
      };
    } else if (age <= 10) {
      return {
        Corrosion: "Moderate rust formation",
        Crack: "Notable crack development",
        Debris: "Moderate debris buildup",
        "Exposed Rebar": "Initial rebar visibility",
        Spalling: "Early concrete deterioration",
        overall: "Fair condition, maintenance recommended"
      };
    } else if (age <= 15) {
      return {
        Corrosion: "Significant corrosion present",
        Crack: "Deep cracks forming",
        Debris: "Substantial debris accumulation",
        "Exposed Rebar": "Multiple exposed sections",
        Spalling: "Advanced concrete degradation",
        overall: "Poor condition, repairs needed"
      };
    } else {
      return {
        Corrosion: "Severe structural rust",
        Crack: "Critical crack formation",
        Debris: "Heavy debris obstruction",
        "Exposed Rebar": "Widespread rebar exposure",
        Spalling: "Severe concrete failure",
        overall: "Critical condition, immediate attention required"
      };
    }
  };
  
  const LayerPanel = ({ resetCamera, year, onClose }) => {
    const [mounted, setMounted] = useState(false);
    const conditions = getConditionDescription(year);
    
    useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
    }, []);
  
    // Define layers here
    const layers = {
      'Road Condition': [
        { 
          id: 'A1', 
          name: 'Road Cracks', 
          icon: '🛣️',
          condition: conditions.Crack 
        },
        { 
          id: 'A2', 
          name: 'Surface Damage', 
          icon: '⚠️',
          condition: conditions.Crack 
        }
      ],
      'Structural Issues': [
        { 
          id: 'B1', 
          name: 'Fence Rust', 
          icon: '🔧',
          condition: conditions.Corrosion 
        },
        { 
          id: 'B2', 
          name: 'Pillar Damage', 
          icon: '🏗️',
          condition: conditions.Spalling 
        }
      ],
      'Environmental Damage': [
        { 
          id: 'C1', 
          name: 'Moss Growth', 
          icon: '🌱',
          condition: conditions.Debris 
        },
        { 
          id: 'C2', 
          name: 'Water Damage', 
          icon: '💧',
          condition: conditions.Spalling 
        }
      ]
    };
  
    const panelStyle = {
      position: 'absolute',
      right: '20px',
      top: '20px',
      background: 'rgba(0, 0, 0, 0.85)',
      padding: '20px',
      borderRadius: '16px',
      color: 'white',
      maxHeight: '80vh',
      overflowY: 'auto',
      minWidth: '300px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: mounted ? 'translateX(0)' : 'translateX(100%)',
      opacity: mounted ? 1 : 0,
    };
  
    const headerStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      borderBottom: '1px solid rgba(255,255,255,0.2)',
      paddingBottom: '10px',
      transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
      opacity: mounted ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
    };
  
    const closeButtonStyle = {
      background: 'none',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      ':hover': {
        background: 'rgba(255, 255, 255, 0.1)',
      }
    };
  
    const categoryStyle = (index) => ({
      marginBottom: '20px',
      transform: mounted ? 'translateX(0)' : 'translateX(50px)',
      opacity: mounted ? 1 : 0,
      transition: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${0.1 + index * 0.1}s`,
    });
  
    return (
      <div style={panelStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Structural Assessment
          </h3>
          <button 
            onClick={onClose}
            style={closeButtonStyle}
          >
            {Icons.close}
          </button>
        </div>
  
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '15px',
          borderRadius: '12px',
          marginBottom: '20px',
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          opacity: mounted ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
        }}>
          <h4 style={{ 
            margin: '0 0 8px 0', 
            color: '#4CAF50',
            fontSize: '16px',
            fontWeight: '500'
          }}>Overall Condition</h4>
          <p style={{ 
            margin: 0, 
            fontSize: '14px',
            lineHeight: '1.5'
          }}>{conditions.overall}</p>
        </div>
  
        {Object.entries(layers).map(([category, items], index) => (
          <div key={category} style={categoryStyle(index)}>
            <h4 style={{ 
              color: '#ffffff', 
              marginBottom: '12px',
              fontSize: '16px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {category}
            </h4>
            {items.map((item, itemIndex) => (
              <div key={item.id} style={{
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                transform: mounted ? 'translateX(0)' : 'translateX(30px)',
                opacity: mounted ? 1 : 0,
                transition: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${0.2 + (index * 0.1) + (itemIndex * 0.05)}s`,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '5px'
                }}>
                  <span style={{ marginRight: '10px' }}>{item.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.name}</span>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#aaa',
                  marginLeft: '25px',
                  lineHeight: '1.4'
                }}>
                  {item.condition}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };
  const CustomControls = ({ controlMode }) => {
    const { camera, gl: { domElement } } = useThree();
    const controls = useRef();
    const touchStart = useRef({ y: 0 });
    const lastZoom = useRef(0);

    useEffect(() => {
        const handleTouchStart = (e) => {
            e.preventDefault();
            if (controlMode === 'zoom') {
                touchStart.current.y = e.touches[0].clientY;
                lastZoom.current = 0;
            }
        };

        const handleTouchMove = (e) => {
            e.preventDefault();
            if (controlMode === 'zoom' && e.touches.length === 1) {
                const deltaY = touchStart.current.y - e.touches[0].clientY;
                const zoomSpeed = 0.01;
                const newZoom = deltaY * zoomSpeed;
                const zoomDelta = newZoom - lastZoom.current;
                
                if (controls.current) {
                    controls.current.object.position.multiplyScalar(1 - zoomDelta);
                    lastZoom.current = newZoom;
                }
            }
        };

        domElement.addEventListener('touchstart', handleTouchStart, { passive: false });
        domElement.addEventListener('touchmove', handleTouchMove, { passive: false });

        return () => {
            domElement.removeEventListener('touchstart', handleTouchStart);
            domElement.removeEventListener('touchmove', handleTouchMove);
        };
    }, [controlMode, domElement]);

    useFrame(() => {
        if (controls.current) {
            controls.current.update();
        }
    });

    return (
        <OrbitControls
            ref={controls}
            args={[camera, domElement]}
            enablePan={controlMode === 'pan'}
            enableZoom={controlMode === 'zoom' || controlMode === 'orbit'}
            enableRotate={controlMode === 'orbit'}
            mouseButtons={{
                LEFT: controlMode === 'orbit'
                    ? THREE.MOUSE.ROTATE
                    : controlMode === 'pan'
                        ? THREE.MOUSE.PAN
                        : THREE.MOUSE.DOLLY,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN
            }}
            touches={{
                ONE: controlMode === 'orbit'
                    ? THREE.TOUCH.ROTATE
                    : controlMode === 'pan'
                        ? THREE.TOUCH.PAN
                        : THREE.TOUCH.DOLLY,
                TWO: THREE.TOUCH.DOLLY_PAN
            }}
            enabled={true}
            rotateSpeed={controlMode === 'orbit' ? 0.5 : 0}
            zoomSpeed={controlMode === 'zoom' ? 0.5 : 0.3}
            panSpeed={controlMode === 'pan' ? 0.8 : 0.5}
            minPolarAngle={0} // Limit vertical rotation (up)
            maxPolarAngle={Math.PI / 2} // Limit vertical rotation (down) to 90 degrees
            minAzimuthAngle={-Math.PI / 2} // Optional: Limit horizontal rotation
            maxAzimuthAngle={Math.PI / 2} // Optional: Limit horizontal rotation
            minDistance={5} // Minimum zoom distance
            maxDistance={100} // Maximum zoom distance
            // Additional touch-specific settings
            enableTouchRotate={controlMode === 'orbit'}
            enableTouchPan={controlMode === 'pan'}
            enableTouchZoom={true}
            // Ground collision prevention
            target={[0, 0, 0]} // Set the target point
            // Additional constraints
            maxPolarAngle={Math.PI / 2} // This prevents going below the ground plane
            enableDamping={true} // Optional: adds smooth movement
            dampingFactor={0.05} // Optional: adjusts smoothness
        />
    );
};

const isTouchDevice = () => {
    if (typeof window === 'undefined') return false;
    
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
};

const BridgeScene = () => {
    const [year, setYear] = useState(2000);
    const [isTouch, setIsTouch] = useState(false);
    const [controlMode, setControlMode] = useState('orbit');
    const cameraRef = useRef();
    const [showLayers, setShowLayers] = useState(false);
    const [selectedHotspot, setSelectedHotspot] = useState(null);
    const handleYearChange = (event) => {
        const value = parseFloat(event.target.value);
        setYear(Math.round(value));
    };
    useEffect(() => {
        setIsTouch(isTouchDevice());
    }, []);
    const ControlButtons = () => (
        <ControlPanel 
            setControlMode={setControlMode} 
            controlMode={controlMode}
            isTouch={isTouch}
        />
    );
    const resetCamera = () => {
        if (cameraRef.current) {
          cameraRef.current.position.set(-10, 40, -18);
          cameraRef.current.lookAt(0, 0, 0);
        }
      };
    return (
        
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <Canvas
                shadows
                camera={{ 
                    position: [-15, 40, -18],
                    fov: 75,
                    near: 0.01,
                    far: 10000
                }}
            >
         
             
          <directionalLight position={[10, 10, 5]} intensity={2.6} />
          <directionalLight position={[-10,- 10,- 5]} intensity={2.6} />
<Stage environment={null} adjustCamera={false}>
<Model year={year} setSelectedHotspot={setSelectedHotspot} />
</Stage>
              

        <CustomControls controlMode={controlMode} />
            </Canvas>
            <ControlButtons />
            {isTouch && controlMode !== 'orbit' && (
                <div style={{
                    position: 'absolute',
                    bottom: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 0, 0, 0.7)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    color: 'white',
                    fontSize: '12px'
                }}>
                    {controlMode === 'pan' ? 'Drag to pan' : 'Pinch to zoom'}
                </div>
            )}
          {selectedHotspot && (
  <div style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'white',
    padding: '25px',
    borderRadius: '15px',
    zIndex: 1000,
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    maxWidth: '500px',
    width: '90%'
  }}>
    <button 
      onClick={() => setSelectedHotspot(null)}
      style={{
        position: 'absolute',
        right: '15px',
        top: '15px',
        background: 'rgba(0, 0, 0, 0.1)',
        border: 'none',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
          background: 'rgba(0, 0, 0, 0.2)',
        }
      }}
    >
      ×
    </button>
    <h3 style={{
      margin: '0 0 15px 0',
      fontSize: '20px',
      fontWeight: '600',
      color: '#333'
    }}>{selectedHotspot.label}</h3>
    <div style={{
      width: '100%',
      height: '300px',
      marginBottom: '20px',
      borderRadius: '10px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Image 
      width={300}
      height={270}
        src={selectedHotspot.image}
        alt={selectedHotspot.label}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/placeholder-image.jpg'; // Fallback image
        }}
      />
    </div>
    <p style={{
      margin: '0',
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#666'
    }}>{selectedHotspot.description}</p>
  </div>
)}

            <ControlPanel setControlMode={setControlMode} controlMode={controlMode} />
            <MenuButton 
        onClick={() => setShowLayers(true)} 
        isOpen={showLayers}
      />

      {showLayers && (
        <LayerPanel 
          resetCamera={resetCamera} 
          year={year}
          onClose={() => setShowLayers(false)}
        />
      )}  <div
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    maxWidth: '600px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    padding: '20px',
                    borderRadius: '10px',
                    color: 'white',
                }}
            >
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '10px',
                    alignItems: 'center' 
                }}>
                    <span>Year: {year.toFixed(1)}</span>
                    <input
                        type="range"
                        min={2000}
                        max={2020}
                        value={year}
                        step="0.1"
                        onChange={handleYearChange}
                        style={{
                            width: '100%',
                            height: '20px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            WebkitAppearance: 'none',
                            background: `linear-gradient(to right, 
                                #4CAF50 0%, 
                                #4CAF50 ${((year - 2000) / 20) * 100}%, 
                                #ddd ${((year - 2000) / 20) * 100}%, 
                                #ddd 100%)`,
                        }}
                    />
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        width: '100%',
                        fontSize: '0.8rem' 
                    }}>
                        <span>2000</span>
                        <span>2005</span>
                        <span>2010</span>
                        <span>2015</span>
                        <span>2020</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

useGLTF.preload('/Bridge.glb');

export default BridgeScene;