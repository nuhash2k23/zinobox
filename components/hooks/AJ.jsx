// import React, { useRef, useMemo, useState } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { OrbitControls, Grid, Text } from '@react-three/drei';
// import * as THREE from 'three';

// function SmallerPart({ position = [0, 0, 0], rotation = [0, 0, 0], color = "#2563eb", showVentingHoles = false }) {
//   const meshRef = useRef();
  
//   // Smaller dimensions - height 50% smaller
//   const totalWidth = 100; // Same width
//   const height = 50; // 50% of original 100mm
//   const depth = 20; // Same depth
  
//   // Capsule hole dimensions (same as original)
//   const capsuleWidth = 35;
//   const capsuleHeight = 20;
//   const capsuleRadius = capsuleHeight / 2;

//   // Create the geometry with only capsule holes (no circular holes)
//   const geometry = useMemo(() => {
//     // Create the outer rectangle shape with rounded corners on left side
//     const rectShape = new THREE.Shape();
//     const cornerRadius = 20; // 20mm corner radius for left corners
    
//     // Start at bottom-right corner (sharp)
//     rectShape.moveTo(totalWidth/2, -height/2);
    
//     // Right edge up to top-right corner (sharp)
//     rectShape.lineTo(totalWidth/2, height/2);
    
//     // Top edge to start of top-left corner
//     rectShape.lineTo(-totalWidth/2 + cornerRadius, height/2);
    
//     // Top-left rounded corner
//     rectShape.absarc(-totalWidth/2 + cornerRadius, height/2 - cornerRadius, cornerRadius, Math.PI/2, Math.PI, false);
    
//     // Left edge down to start of bottom-left corner  
//     rectShape.lineTo(-totalWidth/2, -height/2 + cornerRadius);
    
//     // Bottom-left rounded corner
//     rectShape.absarc(-totalWidth/2 + cornerRadius, -height/2 + cornerRadius, cornerRadius, Math.PI, 3*Math.PI/2, false);
    
//     // Bottom edge back to start (sharp right corners)
//     rectShape.lineTo(totalWidth/2, -height/2);

//     // Function to create a horizontal capsule-shaped hole
//     const createCapsuleHole = (centerX, centerY) => {
//       const capsuleHole = new THREE.Path();
//       const halfHeight = capsuleHeight / 2;
//       const halfWidth = capsuleWidth / 2;
      
//       // Start at the top of the right semicircle
//       capsuleHole.moveTo(centerX + halfWidth - capsuleRadius, centerY + halfHeight);
      
//       // Right semicircle
//       capsuleHole.absarc(centerX + halfWidth - capsuleRadius, centerY, capsuleRadius, Math.PI/2, -Math.PI/2, true);
      
//       // Bottom side
//       capsuleHole.lineTo(centerX - halfWidth + capsuleRadius, centerY - halfHeight);
      
//       // Left semicircle
//       capsuleHole.absarc(centerX - halfWidth + capsuleRadius, centerY, capsuleRadius, -Math.PI/2, Math.PI/2, true);
      
//       // Top side back to start
//       capsuleHole.lineTo(centerX + halfWidth - capsuleRadius, centerY + halfHeight);
      
//       return capsuleHole;
//     };
    
//     // Function to create a half cutoff capsule
//     const createHalfCapsuleHole = (centerX, centerY) => {
//       const halfCapsuleHole = new THREE.Path();
//       const halfHeight = capsuleHeight / 2;
//       const halfWidth = capsuleWidth / 2;
//       const cutoffLeft = centerX - halfWidth;
//       const rightEnd = centerX + halfWidth;
      
//       // Start at top left of cutoff
//       halfCapsuleHole.moveTo(cutoffLeft, centerY + halfHeight);
      
//       // Top horizontal line to start of right semicircle
//       halfCapsuleHole.lineTo(rightEnd - capsuleRadius, centerY + halfHeight);
      
//       // Right semicircle
//       halfCapsuleHole.absarc(rightEnd - capsuleRadius, centerY, capsuleRadius, Math.PI/2, -Math.PI/2, true);
      
//       // Bottom horizontal line back to cutoff left
//       halfCapsuleHole.lineTo(cutoffLeft, centerY - halfHeight);
      
//       // Left vertical line back to start
//       halfCapsuleHole.lineTo(cutoffLeft, centerY + halfHeight);
      
//       return halfCapsuleHole;
//     };
    
//     // Create one half capsule and one full capsule in center
//     const centerHalfCapsule = createHalfCapsuleHole(-27.5, 0);
//     const centerFullCapsule = createCapsuleHole(27.5, 0);
    
//     // Only add capsule holes if showVentingHoles is true
//     if (showVentingHoles) {
//       rectShape.holes.push(centerHalfCapsule);
//       rectShape.holes.push(centerFullCapsule);
//     }

//     // Extrude the shape to create 3D geometry
//     const extrudeSettings = {
//       depth: depth,
//       bevelEnabled: true,
//       bevelThickness: 0.5,
//       bevelSize: 0.3,
//       bevelSegments: 3,
//     };

//     const geom = new THREE.ExtrudeGeometry(rectShape, extrudeSettings);
    
//     // Center the geometry
//     geom.translate(0, 0, -depth/2);
    
//     return geom;
//   }, [totalWidth, height, depth, capsuleWidth, capsuleHeight, capsuleRadius, showVentingHoles]); // SmallerPart now needs showVentingHoles too

//   return (
//     <mesh ref={meshRef} geometry={geometry} position={position} rotation={rotation}>
//       <meshStandardMaterial 
//         color={color} 
//         side={THREE.DoubleSide}
//         metalness={0.7}
//         roughness={0.2}
//       />
//     </mesh>
//   );
// }

// function PrecisionPart({ showVentingHoles = false }) {
//   const meshRef = useRef();
  
//   // Real-life dimensions in millimeters
//   const totalWidth = 100; // 45 + 10 + 45
//   const height = 100;
//   const depth = 20;
//   const holeRadius = 3; // 3mm radius holes in center section
//   const holeSpacing = 25; // 25mm between hole centers
  
//   // Capsule hole dimensions (horizontal orientation)
//   const capsuleWidth = 35; // 30mm wide (horizontal)
//   const capsuleHeight = 20; // 6mm tall (vertical)
//   const capsuleRadius = capsuleHeight / 2;

//   // Create the geometry with holes
//   const geometry = useMemo(() => {
//     // Create the outer rectangle shape
//     const rectShape = new THREE.Shape();
//     rectShape.moveTo(-totalWidth/2, -height/2);
//     rectShape.lineTo(totalWidth/2, -height/2);
//     rectShape.lineTo(totalWidth/2, height/2);
//     rectShape.lineTo(-totalWidth/2, height/2);
//     rectShape.lineTo(-totalWidth/2, -height/2);

//     // Create first circular hole (left, center section)
//     const hole1 = new THREE.Path();
//     hole1.absarc(-holeSpacing/2, 0, holeRadius, 0, Math.PI * 2, false);
    
//     // Create second circular hole (right, center section)
//     const hole2 = new THREE.Path();
//     hole2.absarc(holeSpacing/2, 0, holeRadius, 0, Math.PI * 2, false);
    
//     // Function to create a horizontal capsule-shaped hole
//     const createCapsuleHole = (centerX, centerY) => {
//       const capsuleHole = new THREE.Path();
//       const halfHeight = capsuleHeight / 2;
//       const halfWidth = capsuleWidth / 2;
      
//       // Start at the top of the right semicircle
//       capsuleHole.moveTo(centerX + halfWidth - capsuleRadius, centerY + halfHeight);
      
//       // Right semicircle
//       capsuleHole.absarc(centerX + halfWidth - capsuleRadius, centerY, capsuleRadius, Math.PI/2, -Math.PI/2, true);
      
//       // Bottom side
//       capsuleHole.lineTo(centerX - halfWidth + capsuleRadius, centerY - halfHeight);
      
//       // Left semicircle
//       capsuleHole.absarc(centerX - halfWidth + capsuleRadius, centerY, capsuleRadius, -Math.PI/2, Math.PI/2, true);
      
//       // Top side back to start
//       capsuleHole.lineTo(centerX + halfWidth - capsuleRadius, centerY + halfHeight);
      
//       return capsuleHole;
//     };
    
//     // Function to create a half cutoff capsule (positioned within section, not at edge)
//     const createHalfCapsuleHole = (centerX, centerY) => {
//       const halfCapsuleHole = new THREE.Path();
//       const halfHeight = capsuleHeight / 2;
//       const halfWidth = capsuleWidth / 2;
//       const cutoffLeft = centerX - halfWidth; // Left edge of the half capsule
//       const rightEnd = centerX + halfWidth; // Right end with semicircle
      
//       // Start at top left of cutoff
//       halfCapsuleHole.moveTo(cutoffLeft, centerY + halfHeight);
      
//       // Top horizontal line to start of right semicircle
//       halfCapsuleHole.lineTo(rightEnd - capsuleRadius, centerY + halfHeight);
      
//       // Right semicircle
//       halfCapsuleHole.absarc(rightEnd - capsuleRadius, centerY, capsuleRadius, Math.PI/2, -Math.PI/2, true);
      
//       // Bottom horizontal line back to cutoff left
//       halfCapsuleHole.lineTo(cutoffLeft, centerY - halfHeight);
      
//       // Left vertical line back to start (this creates the flat cutoff)
//       halfCapsuleHole.lineTo(cutoffLeft, centerY + halfHeight);
      
//       return halfCapsuleHole;
//     };
    
//     // Create upper capsules (moved up for better spacing)
//     const leftUpperCapsuleHole = createHalfCapsuleHole(-27.5, 15);
//     const rightUpperCapsuleHole = createCapsuleHole(27.5, 15);
    
//     // Create lower capsules
//     const leftLowerCapsuleHole = createHalfCapsuleHole(-27.5, -15);
//     const rightLowerCapsuleHole = createCapsuleHole(27.5, -15);
    
//     // Add all holes to the shape
//     // Always include circular holes
//     rectShape.holes.push(hole1);
//     rectShape.holes.push(hole2);
    
//     // Only add capsule holes if showVentingHoles is true
//     if (showVentingHoles) {
//       rectShape.holes.push(leftUpperCapsuleHole);
//       rectShape.holes.push(rightUpperCapsuleHole);
//       rectShape.holes.push(leftLowerCapsuleHole);
//       rectShape.holes.push(rightLowerCapsuleHole);
//     }

//     // Extrude the shape to create 3D geometry
//     const extrudeSettings = {
//       depth: depth,
//       bevelEnabled: true,
//       bevelThickness: 0.5,
//       bevelSize: 0.3,
//       bevelSegments: 3,
//     };

//     const geom = new THREE.ExtrudeGeometry(rectShape, extrudeSettings);
    
//     // Center the geometry
//     geom.translate(0, 0, -depth/2);
    
//     return geom;
//   }, [totalWidth, height, depth, holeSpacing, holeRadius, capsuleWidth, capsuleHeight, capsuleRadius, showVentingHoles]); // PrecisionPart needs all these variables

//   // Gentle rotation for inspection
//   useFrame((state) => {
//     if (meshRef.current) {
//       meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
//       meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.1;
//     }
//   });

//   return (
//     <mesh ref={meshRef} geometry={geometry} position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
//       <meshStandardMaterial 
//         color="#2563eb" 
//         side={THREE.DoubleSide}
//         metalness={0.7}
//         roughness={0.2}
//       />
//     </mesh>
//   );
// }

// function DimensionLabels({ showVentingHoles }) {
//   return (
//     <group>
//       {/* Width sections labels */}
//       <Text
//         position={[-27.5, -60, 0]}
//         fontSize={6}
//         color="#ffffff"
//         anchorX="center"
//         anchorY="middle"
//       >
//         45mm
//       </Text>
      
//       <Text
//         position={[0, -60, 0]}
//         fontSize={6}
//         color="#ffffff"
//         anchorX="center"
//         anchorY="middle"
//       >
//         10mm
//       </Text>
      
//       <Text
//         position={[27.5, -60, 0]}
//         fontSize={6}
//         color="#ffffff"
//         anchorX="center"
//         anchorY="middle"
//       >
//         45mm
//       </Text>
      
//       {/* Total width label */}
//       <Text
//         position={[0, -70, 0]}
//         fontSize={8}
//         color="#ffffff"
//         anchorX="center"
//         anchorY="middle"
//       >
//         100mm Total Width
//       </Text>
      
//       {/* Height label */}
//       <Text
//         position={[-60, 0, 0]}
//         fontSize={8}
//         color="#ffffff"
//         anchorX="center"
//         anchorY="middle"
//         rotation={[0, 0, Math.PI/2]}
//       >
//         100mm Height
//       </Text>
      
//       {/* Depth label */}
//       <Text
//         position={[60, 30, 0]}
//         fontSize={6}
//         color="#ffffff"
//         anchorX="center"
//         anchorY="middle"
//       >
//         20mm Depth
//       </Text>
      
//       {/* Center holes specification */}
//       <Text
//         position={[0, 70, 0]}
//         fontSize={5}
//         color="#ffdd44"
//         anchorX="center"
//         anchorY="middle"
//       >
//         Center: Ø6mm Through Holes (25mm spacing)
//       </Text>
      
//       {/* Capsule holes specification */}
//       <Text
//         position={[0, 80, 0]}
//         fontSize={5}
//         color="#ff6b44"
//         anchorX="center"
//         anchorY="middle"
//       >
//         Capsules: {showVentingHoles ? 'Through Holes' : 'Filled Solid'} | All Parts
//       </Text>
//     </group>
//   );
// }

// function Scene({ showVentingHoles }) {
//   return (
//     <>
//       {/* Lighting setup */}
//       <ambientLight intensity={0.4} />
//       <directionalLight position={[100, 100, 50]} intensity={1.2} castShadow />
//       <directionalLight position={[-50, 50, 30]} intensity={0.6} />
//       <pointLight position={[0, 0, 100]} intensity={0.4} />
      
//       {/* Grid for scale reference */}
//       <Grid 
//         args={[200, 200]} 
//         cellSize={10} 
//         cellThickness={0.5} 
//         cellColor="#444444" 
//         sectionSize={50} 
//         sectionThickness={1} 
//         sectionColor="#666666"
//         position={[0, 0, -15]}
//       />
      
//       {/* The main precision part */}
//       <PrecisionPart showVentingHoles={showVentingHoles} />
      
//       {/* Two additional smaller parts with random positions and rotations */}
//       <SmallerPart 
//         position={[150, 80, 0]} 
//         rotation={[0, 0, Math.PI/3]} 
//         color="#e11d48" 
//         showVentingHoles={showVentingHoles}
//       />
      
//       <SmallerPart 
//         position={[-120, -60, 0]} 
//         rotation={[0, 0, -Math.PI/4]} 
//         color="#059669" 
//         showVentingHoles={showVentingHoles}
//       />
      
//       {/* Dimension labels */}
//       <DimensionLabels showVentingHoles={showVentingHoles} />
      
//       {/* Camera controls */}
//       <OrbitControls 
//         enablePan={true} 
//         enableZoom={true} 
//         enableRotate={true}
//         minDistance={50}
//         maxDistance={300}
//       />
//     </>
//   );
// }

// export default function App() {
//   const [showVentingHoles, setShowVentingHoles] = useState(false); // Initially filled (false = filled)

//   return (
//     <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }}>
//       {/* Venting Holes Toggle Button */}
//       <div style={{
//         position: 'absolute',
//         top: '20px',
//         right: '20px',
//         zIndex: 100
//       }}>
//         <button
//           onClick={() => setShowVentingHoles(!showVentingHoles)}
//           style={{
//             padding: '12px 20px',
//             backgroundColor: showVentingHoles ? '#059669' : '#dc2626',
//             color: 'white',
//             border: 'none',
//             borderRadius: '8px',
//             fontSize: '14px',
//             fontWeight: 'bold',
//             cursor: 'pointer',
//             fontFamily: 'monospace',
//             transition: 'all 0.3s ease'
//           }}
//         >
//           Capsule Holes: {showVentingHoles ? 'ON' : 'OFF'}
//         </button>
//       </div>
      
//       <div style={{
//         position: 'absolute',
//         top: '20px',
//         left: '20px',
//         color: '#ffffff',
//         fontFamily: 'monospace',
//         fontSize: '14px',
//         background: 'rgba(0,0,0,0.7)',
//         padding: '10px',
//         borderRadius: '5px',
//         zIndex: 100
//       }}>
//         <div><strong>Precision Machined Parts (3 Total)</strong></div>
//         <div><strong>Main:</strong> 100mm × 100mm × 20mm</div>
//         <div>Width: 45mm + 10mm + 45mm</div>
//         <div>Center: Two Ø6mm through holes (always visible)</div>
//         <div>Capsules: {showVentingHoles ? 'Through' : 'Filled'}</div>
//         <div>Left: 2 Half cutoff capsules ({showVentingHoles ? 'holes' : 'filled'})</div>
//         <div>Right: 2 Full capsules ({showVentingHoles ? 'holes' : 'filled'})</div>
//         <div><strong>Smaller:</strong> 100mm × 50mm × 20mm</div>
//         <div>1 Half + 1 Full capsule ({showVentingHoles ? 'holes' : 'filled'})</div>
//         <div>Rounded corners on left side (20mm radius)</div>
//       </div>
      
//       <Canvas 
//         camera={{ position: [120, 80, 120], fov: 45 }}
//         shadows
//       >
//         <Scene showVentingHoles={showVentingHoles} />
//       </Canvas>
//     </div>
//   );
// }


import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/*
Enhanced Blob Animation Sequence:
1. Default: Organic blob animation (pulsing)
2. On click: Immediate water ripple + circle formation + fluid ripples (0-10s)
3. After fluid ripples end (10s): Continuous random edge water ripples
4. During random ripples: Click → fluid ripples again (ignore further clicks during fluid)
5. Stop button: Return to default blob animation

Animation States:
- 'idle': Default organic blob
- 'animating': Full sequence (water ripple + circle + fluid ripples)
- 'randomRipples': Continuous random edge ripples
- 'fluidOnly': Just fluid ripples during random ripple phase
*/ 

const vertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Static pink glow blob shader
const pinkGlowFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.9;
    float frequency = 0.8;
    
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(st);
      st *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }
  
  float staticBlob(vec2 pos) {
    return length(pos);
  }
  
  void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 pos = vUv - center;
    
    float distortedDist = staticBlob(pos);
    float glowRadius = 0.45;
    float coreRadius = 0.15;
    
    float core = 1.0 - smoothstep(0.0, coreRadius, distortedDist);
    float outerGlow = 1.0 - smoothstep(coreRadius, glowRadius, distortedDist);
    float noiseTexture = fbm(vUv * 2.0) * 0.3 + 0.7;
    float density = (core * 40.9 + outerGlow * 0.99) * noiseTexture;
    
    vec3 glowColor = vec3(1.0, 0.0, 0.6);
    gl_FragColor = vec4(glowColor, density);
  }
`;

// Enhanced black blob shader with multiple ripple types
const blackBlobFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uClickPos;
  uniform float uRippleTime;
  uniform float uStrokeWidth;
  uniform float uStrokeBlur;
  uniform bool uHasClick;
  uniform int uAnimationState; // 0=idle, 1=animating, 2=randomRipples, 3=fluidOnly
  uniform float uRandomRippleTime;
  
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.9;
    float frequency = 0.8;
    
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(st);
      st *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }
  
  // Organic blob with pulsing (no rotation)
  float organicBlob(vec2 pos, float time) {
    float angle = atan(pos.y, pos.x);
    float dist = length(pos);
    
    float bump1 = -sin(angle * 3.0) * sin(time * 2.0) * 0.015;
    float bump2 = 0.03;
    float bump3 = cos(angle * 3.0) * cos(time * 0.8) * 0.015;
    float bump4 = -sin(angle * 4.0) * sin(time * 0.5) * 0.006;
    float prominentBump = sin(angle * 2.0) * sin(time * 0.4) * 0.02 * sin(time * 1.7);
    
    return dist - (bump1 - bump2 + bump3 + bump4 + prominentBump);
  }
  
  // Circle formation animation
  float circleFormation(vec2 pos, float time, float clickTime) {
    if (clickTime <= 0.0) return organicBlob(pos, time);
    
    float dist = length(pos);
    float blobDist = organicBlob(pos, time);
    
    float formationProgress = smoothstep(0.0, 3.0, clickTime);
    formationProgress = formationProgress * formationProgress * (3.0 - 2.0 * formationProgress);
    
    float reverseProgress = 0.0;
    if (clickTime > 8.0) {
      reverseProgress = smoothstep(8.0, 10.0, clickTime);
      reverseProgress = reverseProgress * reverseProgress * (3.0 - 2.0 * reverseProgress);
    }
    
    float finalFormationProgress = formationProgress * (1.0 - reverseProgress);
    return mix(blobDist, dist, finalFormationProgress);
  }
  
 float waterRipple(vec2 pos, vec2 center, float time) {
float dist = distance(pos, center);
  
  if (time <= 0.0) return 0.0;
  
  float waveSpeed = 0.3;
  float waveRadius = time * waveSpeed;
  
  float distFromWave = dist - waveRadius;
  
  // Create alternating push (outward) and pull (inward) regions
  float waveLength = 0.12;
  float amplitude = 0.03;
  
  // Sine wave creates push-pull pattern
  float pushPull = sin(distFromWave / waveLength * 6.28318) * amplitude;
  
  // Envelope to contain the effect
  float envelope = exp(-abs(distFromWave) / 0.06);
  
  // Time decay
  float timeDecay = exp(-time * 0.6);
  
  return pushPull * envelope * timeDecay;
  }
  
  // Fluid edge ripples
  float fluidRipples(vec2 pos, float time) {
    if (time < 3.5) return 0.0;
    
    float angle = atan(pos.y, pos.x);
    float adjustedTime = time - 3.5;
    
    float ripple1 = sin(angle * 8.0 + adjustedTime * 2.2) * 0.005;
    float ripple2 = sin(angle * 12.0 - adjustedTime * 2.4) * 0.005;
    float ripple3 = sin(angle * 16.0 + adjustedTime * 2.6) * 0.005;
    float ripple4 = sin(angle * 10.0 - adjustedTime * 2.1) * 0.005;
    
    float totalRipple = ripple1 + ripple2 + ripple3 + ripple4;
    
    float fadeIn = smoothstep(3.5, 5.0, time);
    float fadeOut = 1.0 - smoothstep(8.0, 10.0, time);
    float fadeInOut = fadeIn * fadeOut;
    
    float timeVariation = sin(adjustedTime * 0.8) * 0.1 + 0.9;
    return totalRipple * fadeInOut * timeVariation;
  }
  
  // NEW: Random edge water ripples (discrete ripple events like click ripple) - CONTINUOUS LOOP
  float randomEdgeRipples(vec2 pos, float time) {
    float totalRipple = 0.0;
    
    // Create a continuous loop cycle every 15 seconds
    float cycleTime = mod(time, 15.0);
    
    // Ripple 1: Starts at time 0.0
    float ripple1Time = cycleTime;
    float angle1 = 2.3; // Fixed random angle
    vec2 ripple1Pos = vec2(0.5 + cos(angle1) * 0.35, 0.5 + sin(angle1) * 0.35);
    if (ripple1Time < 6.0) {
      totalRipple += waterRipple(pos, ripple1Pos, ripple1Time);
    }
    
    // Ripple 2: Starts at time 2.5
    float ripple2Time = max(0.0, cycleTime - 2.5);
    float angle2 = 4.7; // Fixed random angle
    vec2 ripple2Pos = vec2(0.5 + cos(angle2) * 0.32, 0.5 + sin(angle2) * 0.32);
    if (ripple2Time < 6.0 && cycleTime >= 2.5) {
      totalRipple += waterRipple(pos, ripple2Pos, ripple2Time);
    }
    
    // Ripple 3: Starts at time 5.0
    float ripple3Time = max(0.0, cycleTime - 5.0);
    float angle3 = 0.8; // Fixed random angle
    vec2 ripple3Pos = vec2(0.5 + cos(angle3) * 0.38, 0.5 + sin(angle3) * 0.38);
    if (ripple3Time < 6.0 && cycleTime >= 5.0) {
      totalRipple += waterRipple(pos, ripple3Pos, ripple3Time);
    }
    
    // Ripple 4: Starts at time 7.5
    float ripple4Time = max(0.0, cycleTime - 7.5);
    float angle4 = 1.9; // Fixed random angle
    vec2 ripple4Pos = vec2(0.5 + cos(angle4) * 0.34, 0.5 + sin(angle4) * 0.34);
    if (ripple4Time < 6.0 && cycleTime >= 7.5) {
      totalRipple += waterRipple(pos, ripple4Pos, ripple4Time);
    }
    
    // Ripple 5: Starts at time 10.0
    float ripple5Time = max(0.0, cycleTime - 10.0);
    float angle5 = 3.4; // Fixed random angle
    vec2 ripple5Pos = vec2(0.5 + cos(angle5) * 0.36, 0.5 + sin(angle5) * 0.36);
    if (ripple5Time < 6.0 && cycleTime >= 10.0) {
      totalRipple += waterRipple(pos, ripple5Pos, ripple5Time);
    }
    
    // Ripple 6: Starts at time 12.5
    float ripple6Time = max(0.0, cycleTime - 12.5);
    float angle6 = 5.1; // Fixed random angle
    vec2 ripple6Pos = vec2(0.5 + cos(angle6) * 0.33, 0.5 + sin(angle6) * 0.33);
    if (ripple6Time < 6.0 && cycleTime >= 12.5) {
      totalRipple += waterRipple(pos, ripple6Pos, ripple6Time);
    }
    
    // Additional overlapping ripples for continuous coverage
    // Second set with different angles for variety
    float cycle2Time = mod(time + 7.5, 15.0); // Offset by half cycle
    
    // Ripple 7: Offset cycle starts at 0.0
    float ripple7Time = cycle2Time;
    float angle7 = 1.1;
    vec2 ripple7Pos = vec2(0.5 + cos(angle7) * 0.37, 0.5 + sin(angle7) * 0.37);
    if (ripple7Time < 6.0) {
      totalRipple += waterRipple(pos, ripple7Pos, ripple7Time);
    }
    
    // Ripple 8: Offset cycle starts at 3.0
    float ripple8Time = max(0.0, cycle2Time - 3.0);
    float angle8 = 4.2;
    vec2 ripple8Pos = vec2(0.5 + cos(angle8) * 0.31, 0.5 + sin(angle8) * 0.31);
    if (ripple8Time < 6.0 && cycle2Time >= 3.0) {
      totalRipple += waterRipple(pos, ripple8Pos, ripple8Time);
    }
    
    // Ripple 9: Offset cycle starts at 6.0
    float ripple9Time = max(0.0, cycle2Time - 6.0);
    float angle9 = 0.3;
    vec2 ripple9Pos = vec2(0.5 + cos(angle9) * 0.39, 0.5 + sin(angle9) * 0.39);
    if (ripple9Time < 6.0 && cycle2Time >= 6.0) {
      totalRipple += waterRipple(pos, ripple9Pos, ripple9Time);
    }
    
    return totalRipple;
  }
  
  void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 pos = vUv - center;
    
    float rippleDistortion = 0.0;
    float clickTime = 0.0;
    
    // Handle different animation states
    if (uAnimationState == 1) { // Full animating sequence
      clickTime = uRippleTime;
      float waterRipples = waterRipple(vUv, uClickPos, uRippleTime);
      float fluidRipplesValue = fluidRipples(pos, uRippleTime);
      
      float waterWeight = exp(-max(0.0, uRippleTime - 6.5) * 0.7);
      float fluidWeight = smoothstep(3.0, 5.0, uRippleTime) * (1.0 - smoothstep(8.0, 10.0, uRippleTime));
      
      rippleDistortion = waterRipples * waterWeight + fluidRipplesValue * fluidWeight;
    }
    else if (uAnimationState == 2) { // Random edge ripples
      rippleDistortion = randomEdgeRipples(pos, uRandomRippleTime);
    }
    else if (uAnimationState == 3) { // Fluid only (during random ripples)
      clickTime = uRippleTime;
      float fluidRipplesValue = fluidRipples(pos, uRippleTime);
      float fluidWeight = smoothstep(3.5, 5.0, uRippleTime) * (1.0 - smoothstep(8.0, 10.0, uRippleTime));
      rippleDistortion = fluidRipplesValue * fluidWeight;
      
      // Also add random ripples in background
      rippleDistortion += randomEdgeRipples(pos, uRandomRippleTime) * 0.3;
    }
    
    float distortedDist = circleFormation(pos, uTime, clickTime) + rippleDistortion;
    
    // Main blob rendering (same as before)
    float blobRadius = 0.35;
    float blobBlurAmount = 0.00013;
    
    float borderWidth = 0.025;
    float borderOuterRadius = blobRadius + borderWidth;
    float borderInnerRadius = blobRadius - borderWidth * 0.3;
    
    float borderCore = 1.0 - smoothstep(borderInnerRadius, blobRadius, distortedDist);
    float borderOuter = 1.0 - smoothstep(blobRadius, borderOuterRadius, distortedDist);
    
    float noiseTexture = fbm(vUv * 2.0) * 0.3 + 0.7;
    float borderDensity = (borderOuter - borderCore) * noiseTexture * 0.8;
    
    float blob = 1.0 - smoothstep(blobRadius - blobBlurAmount, blobRadius + blobBlurAmount, distortedDist);
    
    float shadowOffset = 0.008;
    vec2 shadowPos = pos + vec2(shadowOffset, -shadowOffset);
    float shadowDist = circleFormation(shadowPos, uTime, clickTime) + rippleDistortion;
    float shadowBlurAmount = 0.015;
    float shadowOuterRadius = blobRadius + uStrokeWidth;
    
    float shadow = smoothstep(blobRadius, blobRadius + shadowBlurAmount, shadowDist) * 
                   (1.0 - smoothstep(shadowOuterRadius - shadowBlurAmount, shadowOuterRadius, shadowDist));
    float shadowSoftness = 1.0 - smoothstep(blobRadius, shadowOuterRadius, shadowDist);
    shadow *= shadowSoftness;
    
    vec3 blobColor = vec3(0.0, 0.0, 0.0);
    vec3 borderColor = vec3(1.0, 0.0, 0.6);
    vec3 shadowColor = vec3(1.0, 0.0, 0.478);
    
    vec3 finalColor = vec3(0.94, 0.94, 0.94);
    float finalAlpha = 0.0;
    
    if (borderDensity > 0.01) {
      finalColor = mix(finalColor, borderColor, borderDensity);
      finalAlpha = max(finalAlpha, borderDensity);
    }
    
    if (shadow > 0.01 && blob < 0.01) {
      finalColor = mix(finalColor, shadowColor, shadow * 0.35);
      finalAlpha = max(finalAlpha, shadow * 0.35);
    }
    
    if (blob > 0.01) {
      finalColor = blobColor;
      finalAlpha = blob;
    }
    
    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;

function PinkGlowBlob({ clickData }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const [hasScaled, setHasScaled] = useState(false);
  const startTime = useRef(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), []);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = 0;
    }
    
    if (meshRef.current && !hasScaled) {
      if (startTime.current === null) {
        startTime.current = time;
      }
      
      const elapsed = time - startTime.current;
      const duration = 2.0;
      
      if (elapsed < duration) {
        const progress = elapsed / duration;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const scale = 0.2 + (easeOut * 0.8);
        meshRef.current.scale.setScalar(scale);
      } else {
        meshRef.current.scale.setScalar(1.0);
        setHasScaled(true);
      }
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0.5, -0.64, -0.001]}>
      <planeGeometry args={[8.5, 8.5]}/>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={pinkGlowFragmentShader}
        uniforms={uniforms}
        transparent={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function BlackBlob({ animationState, onSetAnimationState, onRippleUpdate, strokeWidth = 0.035, strokeBlur = .1}) {
  const meshRef = useRef();
  const materialRef = useRef();
  const [hasScaled, setHasScaled] = useState(false);
  const [cssRipples, setCssRipples] = useState([]);
  const startTime = useRef(null);
  const animationStartTime = useRef(null);
  const randomRippleStartTime = useRef(null);
  const { camera, gl } = useThree();
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uClickPos: { value: new THREE.Vector2(0.5, 0.5) },
    uRippleTime: { value: 0 },
    uStrokeWidth: { value: strokeWidth },
    uStrokeBlur: { value: strokeBlur },
    uHasClick: { value: false },
    uAnimationState: { value: 0 }, // 0=idle, 1=animating, 2=randomRipples, 3=fluidOnly
    uRandomRippleTime: { value: 0 }
  }), [strokeWidth, strokeBlur]);
  
  const handleClick = (event) => {
    event.stopPropagation();
    
    const rect = gl.domElement.getBoundingClientRect();
    const screenX = (event.clientX - rect.left) / rect.width;
    const screenY = 1.0 - (event.clientY - rect.top) / rect.height;
    
    // Handle clicks based on current state
    if (animationState.state === 'animating') {
      // During full animation (0-10s), check if in fluid ripples phase
      const elapsed = (Date.now() - animationState.startTime) / 1000;
      if (elapsed >= 3.0 && elapsed <= 10.0) {
        console.log('Click ignored during fluid ripples phase');
        return;
      }
    } else if (animationState.state === 'fluidOnly') {
      // During fluid-only phase, ignore clicks
      console.log('Click ignored during fluid-only phase');
      return;
    } else if (animationState.state === 'randomRipples') {
      // During random ripples, trigger fluid-only animation
      console.log('Starting fluid-only animation');
      onSetAnimationState({
        state: 'fluidOnly',
        startTime: Date.now(),
        clickPos: [screenX, screenY]
      });
      
      // Create CSS ripple
      const newRipple = {
        id: Date.now(),
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      setCssRipples(prev => [...prev, newRipple]);
      setTimeout(() => {
        setCssRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
      
      return;
    }
    
    // Default click behavior (idle state or early animation)
    console.log('Starting full animation');
    
    // Create CSS ripple
    const newRipple = {
      id: Date.now(),
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    setCssRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setCssRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    onSetAnimationState({
      state: 'animating',
      startTime: Date.now(),
      clickPos: [screenX, screenY]
    });
  };
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uStrokeWidth.value = strokeWidth;
      materialRef.current.uniforms.uStrokeBlur.value = strokeBlur;
      
      // Handle animation states
      if (animationState.state === 'animating') {
        const elapsed = (Date.now() - animationState.startTime) / 1000;
        const totalDuration = 10.0;
        
        if (elapsed < totalDuration) {
          materialRef.current.uniforms.uAnimationState.value = 1;
          materialRef.current.uniforms.uRippleTime.value = elapsed;
          materialRef.current.uniforms.uClickPos.value.set(animationState.clickPos[0], animationState.clickPos[1]);
          materialRef.current.uniforms.uHasClick.value = true;
        } else {
          // Animation finished, start random ripples
          onSetAnimationState({
            state: 'randomRipples',
            startTime: Date.now()
          });
        }
      } else if (animationState.state === 'randomRipples') {
        materialRef.current.uniforms.uAnimationState.value = 2;
        materialRef.current.uniforms.uHasClick.value = false;
        const elapsed = (Date.now() - animationState.startTime) / 1000;
        materialRef.current.uniforms.uRandomRippleTime.value = elapsed;
      } else if (animationState.state === 'fluidOnly') {
        const elapsed = (Date.now() - animationState.startTime) / 1000;
        const totalDuration = 10.0;
        
        if (elapsed < totalDuration) {
          materialRef.current.uniforms.uAnimationState.value = 3;
          materialRef.current.uniforms.uRippleTime.value = elapsed;
          materialRef.current.uniforms.uClickPos.value.set(animationState.clickPos[0], animationState.clickPos[1]);
          materialRef.current.uniforms.uHasClick.value = true;
          
          // Keep random ripple time running in background
          const randomElapsed = (Date.now() - animationState.randomRippleStartTime) / 1000;
          materialRef.current.uniforms.uRandomRippleTime.value = randomElapsed;
        } else {
          // Fluid-only finished, return to random ripples
          onSetAnimationState({
            state: 'randomRipples',
            startTime: Date.now()
          });
        }
      } else {
        // Idle state
        materialRef.current.uniforms.uAnimationState.value = 0;
        materialRef.current.uniforms.uHasClick.value = false;
        materialRef.current.uniforms.uRippleTime.value = 0;
        materialRef.current.uniforms.uRandomRippleTime.value = 0;
      }
    }
    
    // Scaling animation
    if (meshRef.current && !hasScaled) {
      if (startTime.current === null) {
        startTime.current = time;
      }
      
      const elapsed = time - startTime.current;
      const duration = 2.0;
      
      if (elapsed < duration) {
        const progress = elapsed / duration;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const scale = 0.2 + (easeOut * 0.8);
        meshRef.current.scale.setScalar(scale);
      } else {
        meshRef.current.scale.setScalar(1.0);
        setHasScaled(true);
      }
    }
  });
  
  return (
    <mesh ref={meshRef} onClick={handleClick}>
      <planeGeometry args={[8, 8]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={blackBlobFragmentShader}
        uniforms={uniforms}
        transparent={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Scene({ strokeWidth = 0.025, strokeBlur = 1.5 }) {
  const [animationState, setAnimationState] = useState({
    state: 'idle', // 'idle', 'animating', 'randomRipples', 'fluidOnly'
    startTime: 0,
    clickPos: [0.5, 0.5],
    randomRippleStartTime: 0
  });
  
  const [cssRipples, setCssRipples] = useState([]);
  
  const handleStop = () => {
    console.log('Stop clicked - returning to idle');
    setAnimationState({
      state: 'idle',
      startTime: 0,
      clickPos: [0.5, 0.5],
      randomRippleStartTime: 0
    });
  };
  
  // Update animation state to include random ripple start time
  const handleSetAnimationState = (newState) => {
    if (newState.state === 'fluidOnly' && animationState.state === 'randomRipples') {
      // When transitioning from random ripples to fluid-only, preserve random ripple time
      newState.randomRippleStartTime = animationState.startTime;
    }
    setAnimationState(newState);
  };
  
  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      <style>{`
        @keyframes rippleScale {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          70% {
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(5);
            opacity: 0;
          }
        }
        
        .css-ripple {
          animation: rippleScale 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        .stop-button {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(255, 0, 102, 0.9);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          z-index: 1000;
        }
        
        .stop-button:hover {
          background: rgba(255, 0, 102, 1);
          transform: scale(1.05);
        }
        
        .state-indicator {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          z-index: 1000;
        }
      `}</style>
      
      {/* Stop Button */}
      <button className="stop-button" onClick={handleStop}>
        STOP
      </button>
      
      {/* State Indicator for debugging */}
      <div className="state-indicator">
        State: {animationState.state}
      </div>
      
      <Canvas
        style={{ 
          height: '100vh', 
          width: '100%', 
          background: '#f0f0f0',
          cursor: 'pointer'
        }}
        camera={{ position: [0, 0, 10], fov: 75 }}
      >
        <PinkGlowBlob />
        <BlackBlob 
          animationState={animationState}
          onSetAnimationState={handleSetAnimationState}
          onRippleUpdate={setCssRipples}
          strokeWidth={strokeWidth} 
          strokeBlur={strokeBlur} 
        />
      </Canvas>
      
      {/* CSS ripples */}
      {cssRipples.map(ripple => (
        <div
          key={ripple.id}
          className="css-ripple"
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: '20px',
            height: '20px',
            border: '3px solid rgba(255, 255, 255, 0.7)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%) scale(0)',
            filter: 'blur(.9px)',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        />
      ))}
    </div>
  );
}

export default Scene;