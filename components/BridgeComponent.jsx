/* eslint-disable react/jsx-no-duplicate-props */
import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {  OrbitControls, useGLTF, Stage } from '@react-three/drei';
import * as THREE from 'three';
import Image from 'next/image';
import { forwardRef, useCallback } from 'react';
import gsap from 'gsap';

const Icons = {
    orbit: (
        <svg width="39" height="31" viewBox="0 0 39 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="19.5774" cy="15.5" r="12" stroke="currentColor" strokeWidth="3"/>
            <path d="M29.0773 4.9998C42.5773 -2.00025 39.0246 5.75986 22.0774 18.9998C6.07738 31.4996 -4.92264 32.9998 7.0774 21.4998" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
    ),
    pan: (
        <svg width="28" height="32" viewBox="0 0 27 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.4474 4.58088V4.58088C22.6627 4.58088 21.8141 4.13065 21.323 3.51854C20.6752 2.71085 19.6393 2.18675 18.4737 2.18675V2.18675C17.6495 2.18675 16.7522 1.75338 16.1918 1.14896C15.54 0.445888 14.5752 0 13.5 0C12.4248 0 11.46 0.445909 10.8082 1.14897C10.2478 1.75341 9.35055 2.18675 8.52632 2.18675V2.18675C6.56739 2.18675 4.97368 3.66667 4.97368 5.48572V12.0931C4.97368 12.7889 4.24838 13.2736 3.55263 13.2736V13.2736C1.59371 13.2736 0 14.7535 0 16.5726V23.3567C0 28.1226 4.17548 32 9.30789 32H17.6921C22.8245 32 27 28.1226 27 23.3567V7.87985C27 6.06073 25.4063 4.58088 23.4474 4.58088ZM24.8684 23.3567C24.8684 27.0312 21.6491 30.0206 17.6921 30.0206H9.30789C5.3509 30.0206 2.13158 27.0312 2.13158 23.3567V16.5726C2.13158 15.8449 2.76906 15.253 3.55263 15.253C4.3362 15.253 4.97368 15.8449 4.97368 16.5726V20.7851C4.97368 21.3738 5.45085 21.8509 6.03947 21.8509V21.8509C6.62809 21.8509 7.10526 21.3738 7.10526 20.7851V5.48572C7.10526 4.7581 7.74275 4.16614 8.52632 4.16614C9.30988 4.16614 9.94737 4.7581 9.94737 5.48572V14.847C9.94737 15.4356 10.4245 15.9128 11.0132 15.9128V15.9128C11.6018 15.9128 12.0789 15.4356 12.0789 14.847V3.29897C12.0789 2.57135 12.7164 1.97938 13.5 1.97938C14.2836 1.97938 14.9211 2.57135 14.9211 3.29897V14.847C14.9211 15.4356 15.3982 15.9128 15.9868 15.9128V15.9128C16.5755 15.9128 17.0526 15.4356 17.0526 14.847V5.48572C17.0526 4.7581 17.6901 4.16614 18.4737 4.16614C19.2573 4.16614 19.8947 4.7581 19.8947 5.48572V14.847C19.8947 15.4356 20.3719 15.9128 20.9605 15.9128V15.9128C21.5491 15.9128 22.0263 15.4356 22.0263 14.847V7.87979C22.0263 7.15217 22.6638 6.5602 23.4474 6.5602C24.2309 6.5602 24.8684 7.15217 24.8684 7.87979V23.3567Z" fill="currentColor"/>
        </svg>
    ),
    zoom: (
        <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="10" stroke="currentColor" strokeWidth="2"/>
            <rect x="18.222" y="21.547" width="3.57258" height="13.5833" rx="1.78629" transform="rotate(-42.3428 18.222 21.547)" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="10" y="5" width="2" height="12" rx="1" fill="currentColor"/>
            <rect x="5" y="12" width="2" height="12" rx="1" transform="rotate(-90 5 12)" fill="currentColor"/>
        </svg>
    ),
    layers: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L3 7L12 12L21 7L12 2Z" strokeLinejoin="round"/>
            <path d="M3 12L12 17L21 12" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
            <path d="M3 17L12 22L21 17" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
        </svg>
    ),
    close: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
};
const CompassRotation = ({ setCompassRotation }) => {
    const { camera } = useThree();
  
    useFrame(() => {
      const angle = Math.atan2(camera.position.x, camera.position.z);
      setCompassRotation(angle);
    });
  
    return null;
};
  
const CompassUI = ({ rotation, onReset }) => {
    return (
        <div
            onClick={onReset}
            style={{
                position: 'absolute',
                top: '40px',
                right: '20px',
                width: '100px',
                height: '100px',
                cursor: 'pointer',
                transform: `rotate(${rotation}rad)`,
                transition: 'transform 0.1s ease-out',
                zIndex: 1000,
            }}
        >
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
            }}>
                <svg
                    width="80"
                    height="80"
                    viewBox="0 0 50 50"
                    fill="none"
                >
                    {/* Outer ring */}
                    <circle 
                        cx="25" 
                        cy="25" 
                        r="23" 
                        stroke="rgba(255, 255, 255, 0.2)" 
                        strokeWidth="1"
                    />
                    
                    {/* Inner ring */}
                    <circle 
                        cx="25" 
                        cy="25" 
                        r="20" 
                        stroke="rgba(255, 255, 255, 0.15)" 
                        strokeWidth="0.5"
                    />

                    {/* Cardinal direction lines */}
                    <line x1="25" y1="5" x2="25" y2="45" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5"/>
                    <line x1="5" y1="25" x2="45" y2="25" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5"/>

                    {/* North Arrow */}
                    <path
                        d="M25 7L29 18L25 15L21 18L25 7Z"
                        fill="#FF4444"
                        stroke="#FF4444"
                        strokeWidth="1"
                    />

                    {/* South Arrow */}
                    <path
                        d="M25 43L28 37L25 39L22 37L25 43Z"
                        fill="white"
                        stroke="white"
                        strokeWidth="0.5"
                    />

                    {/* Cardinal direction markers */}
                    <g style={{ fontSize: "8px", fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>
                        <text x="25" y="14" textAnchor="middle" fill="#FF4444" dominantBaseline="middle">N</text>
                        <text x="25" y="38" textAnchor="middle" fill="white" dominantBaseline="middle">S</text>
                        <text x="38" y="26" textAnchor="middle" fill="white" dominantBaseline="middle">E</text>
                        <text x="12" y="26" textAnchor="middle" fill="white" dominantBaseline="middle">W</text>
                    </g>

                    {/* Tick marks */}
                    {[...Array(8)].map((_, i) => {
                        const angle = (i * Math.PI) / 4;
                        const x1 = 25 + 18 * Math.sin(angle);
                        const y1 = 25 - 18 * Math.cos(angle);
                        const x2 = 25 + 20 * Math.sin(angle);
                        const y2 = 25 - 20 * Math.cos(angle);
                        return (
                            <line
                                key={i}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke="rgba(255, 255, 255, 0.3)"
                                strokeWidth="1"
                            />
                        );
                    })}
                </svg>
            </div>
            {/* Glow effect */}
            <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                boxShadow: '0 0 15px rgba(255, 68, 68, 0.1)',
                pointerEvents: 'none',
            }} />
        </div>
    );
};
const MenuButton = ({ onClick, isOpen }) => (
    <button
        onClick={onClick}
        style={{
            position: 'absolute',
            right: '20px', // Changed from right to left
            top: '200px', // Increased from 20px
            background: 'rgba(0, 0, 0, 0.8)',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 20px', // Increased padding
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '16px', // Increased gap
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isOpen ? 'translateX(calc(-100% - 320px))' : 'translateX(0)', // Modified transform
            opacity: isOpen ? 0 : 1,
        }}
    >
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transform: `scale(${isOpen ? 0.8 : 1})`,
            transition: 'transform 0.3s ease'
        }}>
            <div style={{ transform: 'scale(1.4)' }}>{Icons.layers}</div> {/* Increased icon size */}
            <span style={{ 
                fontSize: '16px', // Increased font size
                fontWeight: '600', // Made font weight bolder
                letterSpacing: '0.01em',
            }}>Layers</span>
        </div>
    </button>
);
  
const Hotspot = ({ position, onClick, label }) => {
    const [hovered, setHovered] = useState(false);
    const { camera } = useThree();
    const billboardRef = useRef();
    const pulseRef = useRef();
    const pulseScaleRef = useRef();
    const pulseOpacityRef = useRef();
    
    // Color constants
    const colors = {
        primary: "#4CAF50",      // Green primary color
        secondary: "#45a049",    // Slightly darker green for hover
        background: "#2A2A2A",   // Dark grey for main fill
        stroke: "#ffffff",       // White for visibility
        pulse: "#4CAF50"        // Green pulse
    };

    useEffect(() => {
        pulseScaleRef.current = 1;
        pulseOpacityRef.current = 1.0;
    }, []);

    useFrame((state) => {
        if (billboardRef.current) {
            billboardRef.current.lookAt(camera.position);
        }

        if (pulseRef.current) {
            const pulseFactor = (Math.sin(state.clock.elapsedTime * 1.5) + 1) / 2; // Slowed down pulse
            pulseScaleRef.current = 1 + (pulseFactor * 0.5); // Larger pulse range
            pulseOpacityRef.current = 0.7 - (pulseFactor * 0.4); // More visible pulse
            
            pulseRef.current.scale.x = pulseScaleRef.current;
            pulseRef.current.scale.y = pulseScaleRef.current;
            pulseRef.current.material.opacity = pulseOpacityRef.current;
        }
    });

    return (
        <group position={position}>
            <group ref={billboardRef}>
                {/* Outer pulsating ring */}
                <mesh ref={pulseRef}>
                    <ringGeometry args={[1.2, 1.3, 32]} /> {/* Larger pulse ring */}
                    <meshBasicMaterial
                        color={colors.pulse}
                        transparent
                        opacity={0.95}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                {/* Background fill */}
                <mesh
                    onClick={onClick}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                >
                    <circleGeometry args={[1.1, 32]} /> {/* Adjusted background size */}
                    <meshBasicMaterial
                        color={colors.background}
                        transparent
                        opacity={0.6}
                    />
                </mesh>
                
                {/* Main outer ring */}
                <mesh>
                    <ringGeometry args={[0.95, 1.1, 32]} /> {/* Thicker main ring */}
                    <meshBasicMaterial
                        color={hovered ? colors.primary : colors.stroke}
                        transparent
                        opacity={1}
                    />
                </mesh>

                {/* Center dot */}
                <mesh>
                    <circleGeometry args={[0.35, 32]} /> {/* Larger center dot */}
                    <meshBasicMaterial
                        color={hovered ? colors.primary : colors.stroke}
                        transparent
                        opacity={1}
                    />
                </mesh>

                {/* Inner ring */}
                <mesh>
                    <ringGeometry args={[0.45, 0.55, 32]} /> {/* Thicker inner ring */}
                    <meshBasicMaterial
                        color={hovered ? colors.secondary : colors.stroke}
                        transparent
                        opacity={hovered ? 1 : 0.8}
                    />
                </mesh>
            </group>
        </group>
    );
};
  const HotspotsContainer = ({ setSelectedHotspot }) => {
    const hotspots = [
      {
        id: 1,
        position: [0.81, 32, 51.684],
        label: "Road Damage",
        description: "Severe cracks and damage seen on the road",
        image: "/road.png"
      },
      {
        id: 2,
        position: [-10, 25, 114],
        label: "Bridge Moss",
        description: "Deep moss of green and black forming in the bridge surface",
        image: "/bridge.png"
      },
      {
        id: 3,
        position: [-9, 32, 90],
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
    const activeColor = '#52aaeb'; // Bright blue for active icon
    const inactiveColor = '#FFFFFF'; // White for inactive icon

    return (
        <div style={{
            position: 'absolute',
            left: '0px',
            top: '50%',
            paddingTop: '7.5vh',
            paddingBottom: '7.5vh',
        
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
            borderRadius: '24px',
            borderTopLeftRadius:'0px',
            borderBottomLeftRadius:'0px',
            background: 'rgba(0, 0, 0,1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '16px 12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            WebkitBackdropFilter: 'blur(10px)', // For Safari support
        }}>
            {[
                { mode: 'orbit', icon: Icons.orbit },
                { mode: 'pan', icon: Icons.pan },
                { mode: 'zoom', icon: Icons.zoom }
            ].map(({ mode, icon }) => (
                <button 
                    key={mode}
                    onClick={() => setControlMode(mode)}
                    onPointerDown={() => setControlMode(mode)}
                    style={{
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'black',
                        border: 'none',
                        borderRadius: '50%',
                        color: controlMode === mode ? activeColor : inactiveColor,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    }}
                >
                    {icon}
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

    const LayerIcon = ({ type }) => {
        switch(type) {
            case 'road':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 6L20 6M4 18L20 18" strokeLinecap="round"/>
                        <path d="M4 12L8 12M16 12L20 12" strokeLinecap="round" opacity="0.5"/>
                        <circle cx="12" cy="12" r="2" fill="currentColor"/>
                    </svg>
                );
            case 'structural':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 21L21 21" strokeLinecap="round"/>
                        <path d="M6 21V12M18 21V12" strokeLinecap="round"/>
                        <path d="M12 21V4" strokeLinecap="round"/>
                        <path d="M12 4L6 12L18 12L12 4Z" strokeLinejoin="round"/>
                    </svg>
                );
            case 'environmental':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12" strokeLinecap="round"/>
                        <path d="M21 5C19.9391 5 19.9391 6.5 19 6.5C18.0609 6.5 18.0609 5 17 5C15.9391 5 15.9391 6.5 15 6.5" strokeLinecap="round"/>
                    </svg>
                );
            default:
                return null;
        }
    };

    const panelStyle = {
        position: 'absolute',
        right: '0px',
        top: '20px',
        zIndex:"2000",
        background: 'rgba(0, 0, 0, 0.85)',
        padding: '24px',
        borderRadius: '20px',
        color: 'white',
        maxHeight: '80vh',
        overflowY: 'auto',
        minWidth: '320px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: mounted ? 'translateX(0)' : 'translateX(100%)',
        opacity: mounted ? 1 : 0,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    };

    return (
        <div style={panelStyle}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {Icons.layers}
                    <h3 style={{ 
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '600',
                        letterSpacing: '-0.01em',
                    }}>Layers</h3>
                </div>
                <button 
                    onClick={onClose}
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                    {Icons.close}
                </button>
            </div>

            <div style={{
                background: 'rgba(76, 175, 80, 0.15)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '24px',
            }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '8px',
                    color: '#4CAF50',
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h4 style={{ 
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '600',
                    }}>Status Check</h4>
                </div>
                <p style={{ 
                    margin: 0,
                    fontSize: '14px',
                    lineHeight: '1.5',
                    color: 'rgba(255, 255, 255, 0.9)',
                }}>{conditions.overall}</p>
            </div>

            {[
                { title: 'Road Condition', type: 'road', items: [
                    { id: 'A1', name: 'Surface Cracks', condition: conditions.Crack },
                    { id: 'A2', name: 'Structural Integrity', condition: conditions.Spalling }
                ]},
                { title: 'Structural Health', type: 'structural', items: [
                    { id: 'B1', name: 'Support Analysis', condition: conditions.Corrosion },
                    { id: 'B2', name: 'Load Capacity', condition: conditions["Exposed Rebar"] }
                ]},
                { title: 'Environmental Impact', type: 'environmental', items: [
                    { id: 'C1', name: 'Weather Damage', condition: conditions.Debris },
                    { id: 'C2', name: 'Erosion Level', condition: conditions.Spalling }
                ]}
            ].map((category, index) => (
                <div key={category.title} 
                    style={{
                        marginBottom: '24px',
                        transform: mounted ? 'translateX(0)' : 'translateX(50px)',
                        opacity: mounted ? 1 : 0,
                        transition: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${0.1 + index * 0.1}s`,
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px',
                    }}>
                        <LayerIcon type={category.type} />
                        <h4 style={{
                            margin: 0,
                            fontSize: '15px',
                            fontWeight: '600',
                            color: 'rgba(255, 255, 255, 0.9)',
                        }}>{category.title}</h4>
                    </div>

                    {category.items.map((item, itemIndex) => (
                        <div key={item.id} 
                            style={{
                                padding: '12px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '10px',
                                marginBottom: '8px',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                        >
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '4px',
                                color: 'rgba(255, 255, 255, 0.9)',
                            }}>{item.name}</div>
                            <div style={{
                                fontSize: '12px',
                                color: 'rgba(255, 255, 255, 0.6)',
                                lineHeight: '1.4',
                            }}>{item.condition}</div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
  const CustomControls = forwardRef(({ controlMode }, ref) => {
    const { camera, gl: { domElement } } = useThree();
    const controls = useRef();

    // Update controls cofiguration whenever control mode changes
    useEffect(() => {
        if (!controls.current) return;

        // Configure based on mode without resetting
        controls.current.enableRotate = controlMode === 'orbit';
        controls.current.enablePan = controlMode === 'pan';
        controls.current.enableZoom = controlMode === 'zoom' || controlMode === 'orbit';

        // Update mouse buttons
        controls.current.mouseButtons = {
            LEFT: controlMode === 'orbit' ? THREE.MOUSE.ROTATE :
                  controlMode === 'pan' ? THREE.MOUSE.PAN :
                  THREE.MOUSE.DOLLY,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };

        // Update touch controls
        controls.current.touches = {
            ONE: controlMode === 'orbit' ? THREE.TOUCH.ROTATE :
                 controlMode === 'pan' ? THREE.TOUCH.PAN :
                 THREE.TOUCH.DOLLY,
            TWO: THREE.TOUCH.DOLLY_PAN
        };

        // Set speeds
        controls.current.rotateSpeed = controlMode === 'orbit' ? 1 : 0;
        controls.current.panSpeed = controlMode === 'pan' ? 1.5 : 1;
        controls.current.zoomSpeed = controlMode === 'zoom' ? 1.5 : 1;

        controls.current.update();
    }, [controlMode]);

    // Set up ref and initial configuration
    useEffect(() => {
        if (controls.current && ref) {
            ref.current = controls.current;
        }
    }, [ref]);

    // Handle continuous updates
    useFrame(() => {
        controls.current?.update();
    });

    return (
        <OrbitControls
            ref={controls}
            args={[camera, domElement]}
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={5}
            maxDistance={200}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2}
        />
    );
});
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
    const [compassRotation, setCompassRotation] = useState(0);
    const controlsRef = useRef();
    const [showLayers, setShowLayers] = useState(false);
    const [selectedHotspot, setSelectedHotspot] = useState(null);


    const handleCompassReset = useCallback(() => {
        if (controlsRef.current) {
            // Store current control mode
            const currentMode = controlMode;
    
            // Temporarily enable all controls for smooth animation
            if (controlsRef.current) {
                controlsRef.current.enableRotate = true;
                controlsRef.current.enablePan = true;
                controlsRef.current.enableZoom = true;
            }
    
            // Create timeline for synchronized animations
            const tl = gsap.timeline({
                onComplete: () => {
                    if (controlsRef.current) {
                        // Restore control mode settings
                        controlsRef.current.enableRotate = currentMode === 'orbit';
                        controlsRef.current.enablePan = currentMode === 'pan';
                        controlsRef.current.enableZoom = currentMode === 'zoom' || currentMode === 'orbit';
                        controlsRef.current.update();
                    }
                }
            });
    
            // Animate camera position
            tl.to(controlsRef.current.object.position, {
                x: 0,
                y: 40,
                z: 100,
                duration: 1.5,
                ease: "power3.inOut"
            }, 0);
    
            // Animate target (look-at point)
            tl.to(controlsRef.current.target, {
                x: 0,
                y: 0,
                z: 0,
                duration: 1.5,
                ease: "sine.in",
                onUpdate: () => controlsRef.current.update()
            }, 0);
        }
    }, [controlMode]);


    const handleYearChange = (event) => {
        const value = parseFloat(event.target.value);
        setYear(value);
    };
    useEffect(() => {
        setIsTouch(isTouchDevice());
    }, []);


    const resetCamera = () => {
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
    };

    const ControlButtons = () => (
        <ControlPanel 
            setControlMode={setControlMode} 
            controlMode={controlMode}
            isTouch={isTouch}
        />
    );

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', background:'white' }}>
          <Canvas
        
    shadows
    camera={{ 
        position: [-15, 40, -18],
        fov: 75,
        near: 0.1,
        far: 1000
    }}
    gl={{ 
        antialias: true,
        alpha: true
    }}
>
<CompassRotation setCompassRotation={setCompassRotation} />
    <directionalLight position={[10, 10, 5]} intensity={2.6} />
    <directionalLight position={[-10, -10, -5]} intensity={2.6} />
    <Stage environment={null} adjustCamera={false}>
        <Model year={year} setSelectedHotspot={setSelectedHotspot} />
    </Stage>
    <CustomControls ref={controlsRef} controlMode={controlMode} />
</Canvas>
<CompassUI 
    rotation={compassRotation}
    onReset={handleCompassReset}  // Add this line back
/>

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
        background: 'rgba(0, 0, 0, 0.85)',
        padding: '24px',
        borderRadius: '20px',
        zIndex: 1000,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        maxWidth: '500px',
        width: '90%',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
        }}>
            <h3 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '600',
                letterSpacing: '-0.01em',
                color: 'rgba(255, 255, 255, 0.95)',
            }}>{selectedHotspot.label}</h3>
            <button 
                onClick={() => setSelectedHotspot(null)}
                style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: 'white',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
                {Icons.close}
            </button>
        </div>
        <div style={{
            width: '100%',
            height: '300px',
            marginBottom: '20px',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            background: 'rgba(0, 0, 0, 0.3)',
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
                    display: 'block',
                }}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.jpg';
                }}
            />
        </div>
        <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '16px',
            borderRadius: '12px',
            marginTop: '16px',
        }}>
            <p style={{
                margin: 0,
                fontSize: '15px',
                lineHeight: '1.6',
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: '400',
            }}>{selectedHotspot.description}</p>
        </div>
    </div>
)}
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
            )}

<div style={{
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80%',
    maxWidth: '600px',
    background: 'rgba(0, 0, 0, 0.75)',
    padding: '24px',
    borderRadius: '16px',
    color: 'white',
    backdropFilter: 'blur(10px)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
}}>
    <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        alignItems: 'center' 
    }}>
        <span style={{ 
            fontSize: '15px', 
            fontWeight: '500',
            letterSpacing: '0.01em',
            color: 'rgba(255, 255, 255, 0.95)',
        }}>
            {Math.floor(year)} {' '}
            <span style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: '400'
            }}>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    [Math.floor((year % 1) * 12)]}
            </span>
        </span>
        <input
            type="range"
            min={2000}
            max={2020}
            value={year}
            step={1/12}
            onChange={handleYearChange}
            style={{
                width: '100%',
                height: '4px',
                borderRadius: '2px',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                background: `linear-gradient(to right, 
                    #4CAF50 0%, 
                    #4CAF50 ${((year - 2000) / 20) * 100}%, 
                    rgba(255, 255, 255, 0.2) ${((year - 2000) / 20) * 100}%, 
                    rgba(255, 255, 255, 0.2) 100%)`,
                '&::-webkit-slider-thumb': {
                    WebkitAppearance: 'none',
                    height: '16px',
                    width: '16px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                },
                '&::-moz-range-thumb': {
                    height: '16px',
                    width: '16px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                },
            }}
        />
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            width: '100%',
            fontSize: '13px',
            fontWeight: '400',
            color: 'rgba(255, 255, 255, 0.6)',
            letterSpacing: '0.01em',
            paddingTop: '4px'
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
