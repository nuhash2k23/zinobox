/* eslint-disable react/jsx-no-duplicate-props */
// import React, { useState, useRef, useEffect } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { Environment, OrbitControls, useGLTF } from '@react-three/drei';
// import * as THREE from 'three';




// export const RustShaderCircle = {
//     uniforms: {
//       baseTexture: { value: null },
//       rustAmount: { value: 0.0 },
//       noiseScale: { value: 4.0 },
//       metalness: { value: .8 },
//       roughness: { value: .2 }
//     },
//     vertexShader: `
//       varying vec2 vUv;
//       void main() {
//         vUv = uv;
//         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//       }
//     `,
//     fragmentShader: `
//       uniform sampler2D baseTexture;
//       uniform float rustAmount;
//       uniform float noiseScale;
//       uniform float metalness;
//       uniform float roughness;
//       varying vec2 vUv;
  
//       float hash(vec2 p) {
//         return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
//       }
  
//       float noise(vec2 p) {
//         vec2 i = floor(p);
//         vec2 f = fract(p);
//         f = f * f * (3.0 - 2.0 * f);
        
//         float a = hash(i);
//         float b = hash(i + vec2(1.0, 0.0));
//         float c = hash(i + vec2(0.0, 1.0));
//         float d = hash(i + vec2(1.0, 1.0));
        
//         return mix(
//           mix(a, b, f.x),
//           mix(c, d, f.x),
//           f.y
//         );
//       }
  
//       float fbm(vec2 p) {
//         float value = 0.0;
//         float amplitude = 0.5;
//         float frequency = 1.0;
//         for(int i = 0; i < 8; i++) {
//           value += amplitude * noise(p * frequency);
//           frequency *= 2.2;
//           amplitude *= 0.6;
//         }
//         return value;
//       }
  
//       void main() {
//         vec4 baseColor = texture2D(baseTexture, vUv);
    
//         float uniqueSeed = 0.7;
//         vec2 uv = vUv * noiseScale + uniqueSeed;
        
//         float n1 = fbm(uv * 2.0);
//         float n2 = fbm(uv * 4.0 + vec2(5.2, 1.3));
//         float n3 = fbm(uv * 8.0 + vec2(9.4, 2.6));
        
//         float rustPattern = (n1 * 0.6 + n2 * 0.25 + n3 * 0.15) * 1.8;
//         rustPattern = pow(rustPattern, 0.65);
        
//         vec4 darkRust = vec4(0.52, 0.28, 0.12, 0.8);
//         vec4 midRust = vec4(0.58, 0.32, 0.15, 0.5);
//         vec4 lightRust = vec4(0.65, 0.38, 0.18, 0.3);
        
//         float threshold = smoothstep(0.3, 0.9, rustAmount);
//         float adjustedPattern = mix(rustPattern, 1.0, threshold);
        
//         vec4 rustMix = mix(
//           darkRust,
//           mix(midRust, lightRust, n2),
//           n1 * n3 * 0.8
//         );
        
//         float finalMix = rustAmount * adjustedPattern;
//         finalMix = mix(finalMix, 1.0, pow(rustAmount, 0.5));
  
        
//         vec4 finalColor = baseColor;
//         finalColor.rgb = mix(
//           baseColor.rgb, 
//           rustMix.rgb, 
//           finalMix * rustMix.a
//         );
        
        
//         finalColor.a = baseColor.a;
        
        
//         finalColor.rgb = mix(finalColor.rgb, finalColor.rgb * (1.0 - roughness), metalness);
        
//         gl_FragColor = finalColor;
//       }
//     `
//   };
  
// export const BridgeRustShader = {
//     uniforms: {
//         baseTexture: { value: null },
//         rustAmount: { value: 0.0 },
//         noiseScale: { value: 4.0 },
//         metalness: { value: .8 },
//         roughness: { value: .2 }
//       },
//       vertexShader: `
//         varying vec2 vUv;
//         void main() {
//           vUv = uv;
//           gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//         }
//       `,
//       fragmentShader: `
//         uniform sampler2D baseTexture;
//         uniform float rustAmount;
//         uniform float noiseScale;
//         uniform float metalness;
//         uniform float roughness;
//         varying vec2 vUv;
    
//         float hash(vec2 p) {
//           return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
//         }
    
//         float noise(vec2 p) {
//           vec2 i = floor(p);
//           vec2 f = fract(p);
//           f = f * f * (3.0 - 2.0 * f);
          
//           float a = hash(i);
//           float b = hash(i + vec2(1.0, 0.0));
//           float c = hash(i + vec2(0.0, 1.0));
//           float d = hash(i + vec2(1.0, 1.0));
          
//           return mix(
//             mix(a, b, f.x),
//             mix(c, d, f.x),
//             f.y
//           );
//         }
    
//         float fbm(vec2 p) {
//           float value = 0.0;
//           float amplitude = 0.5;
//           float frequency = 1.0;
//           for(int i = 0; i < 8; i++) {
//             value += amplitude * noise(p * frequency);
//             frequency *= 2.2;
//             amplitude *= 0.6;
//           }
//           return value;
//         }
    
//         void main() {
//           vec4 baseColor = texture2D(baseTexture, vUv);
      
//           float uniqueSeed = 0.7;
//           vec2 uv = vUv * noiseScale + uniqueSeed;
          
//           float n1 = fbm(uv * 2.0);
//           float n2 = fbm(uv * 4.0 + vec2(5.2, 1.3));
//           float n3 = fbm(uv * 8.0 + vec2(9.4, 2.6));
          
//           float rustPattern = (n1 * 0.6 + n2 * 0.25 + n3 * 0.15) * 1.8;
//           rustPattern = pow(rustPattern, 0.65);
          
//           vec4 darkRust = vec4(0.52, 0.28, 0.12, 0.8);
//           vec4 midRust = vec4(0.58, 0.32, 0.15, 0.5);
//           vec4 lightRust = vec4(0.65, 0.38, 0.18, 0.3);
          
//           float threshold = smoothstep(0.3, 0.9, rustAmount);
//           float adjustedPattern = mix(rustPattern, 1.0, threshold);
          
//           vec4 rustMix = mix(
//             darkRust,
//             mix(midRust, lightRust, n2),
//             n1 * n3 * 0.8
//           );
          
//           float finalMix = rustAmount * adjustedPattern;
//           finalMix = mix(finalMix, 1.0, pow(rustAmount, 0.5));
    
          
//           vec4 finalColor = baseColor;
//           finalColor.rgb = mix(
//             baseColor.rgb, 
//             rustMix.rgb, 
//             finalMix * rustMix.a
//           );
          
          
//           finalColor.a = baseColor.a;
          
          
//           finalColor.rgb = mix(finalColor.rgb, finalColor.rgb * (1.0 - roughness), metalness);
          
//           gl_FragColor = finalColor;
//         }
//       `
//   };
// function Model({ year }) {
//     const { nodes, materials } = useGLTF('/Bridge.glb');
//     const fenceMaterialRef = useRef();
//     const pillarMaterialRef = useRef();

//     useEffect(() => {
//         if (materials) {
//             // Create Physical Shader Material for Rust
//             const createPhysicalShaderMaterial = (shader, baseMaterial) => {
//                 const material = new THREE.MeshPhysicalMaterial({
//                     map: baseMaterial.map,
//                     metalness: 0.8,
//                     roughness: 0,
//                     clearcoat: 0.3,
//                     clearcoatRoughness: 0.25,
//                     transparent: true,
//                     opacity: 1,
//                     blending: THREE.NormalBlending,
//                   });
          
//                   material.onBeforeCompile = (shader) => {
//                     shader.uniforms.rustAmount = { value: 0.0 };
//                     shader.uniforms.noiseScale = { value: 9.0 };
//                     shader.uniforms.baseTexture = { value: baseMaterial.map };
            
//                     // Vertex shader modifications remain the same
//                     shader.vertexShader = shader.vertexShader.replace(
//                       '#include <common>',
//                       `
//                       #include <common>
//                       varying vec2 vUvRust;
//                       `
//                     );
            
//                     shader.vertexShader = shader.vertexShader.replace(
//                       '#include <begin_vertex>',
//                       `
//                       #include <begin_vertex>
//                       vUvRust = uv;
//                       `
//                     );
            
//                     // Fragment shader modifications
//                     shader.fragmentShader = shader.fragmentShader.replace(
//                       '#include <common>',
//                       `
//                       #include <common>
//                       uniform float rustAmount;
//                       uniform float noiseScale;
//                       uniform sampler2D baseTexture;
//                       varying vec2 vUvRust;
            
//                       float hash(vec2 p) {
//                         p = fract(p * vec2(234.34, 435.345));
//                         p += dot(p, p + 34.23);
//                         return fract(p.x * p.y);
//                       }
                    
//                       float noise(vec2 p) {
//                         vec2 i = floor(p);
//                         vec2 f = fract(p);
//                         float a = hash(i);
//                         float b = hash(i + vec2(1.0, 0.0));
//                         float c = hash(i + vec2(0.0, 1.0));
//                         float d = hash(i + vec2(1.0, 1.0));
//                         f = f * f * (3.0 - 2.0 * f);
//                         return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
//                       }
                    
//                       float fbm(vec2 p) {
//                         float value = 0.0;
//                         float amplitude = 0.5;
//                         float frequency = 1.0;
//                         for(int i = 0; i < 8; i++) {
//                           value += amplitude * noise(p * frequency);
//                           frequency *= 2.2;
//                           amplitude *= 0.6;
//                         }
//                         return value;
//                       }
//                       `
//                     );
            
//                     shader.fragmentShader = shader.fragmentShader.replace(
//                       '#include <color_fragment>',
//                       `
//                       #include <color_fragment>
                      
//                       vec2 uv = vUvRust * noiseScale;
//                       float n1 = fbm(uv * 2.0);
//                       float n2 = fbm(uv * 4.0 + vec2(5.2, 1.3));
//                       float n3 = fbm(uv * 8.0 + vec2(9.4, 2.6));
                      
//                       float rustPattern = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2) * 1.5;
//                       rustPattern = pow(rustPattern, 0.7);
                      
//                       vec4 darkRust = vec4(0.82, 0.75, 0.55, 1.0);    // Light sand
//                       vec4 midRust = vec4(0.72, 0.62, 0.42, 0.71);     // Medium sand (transparent)
//                       vec4 lightRust = vec4(0.58, 0.48, 0.28, 0.30);   // Dark sand
                      
//                       float threshold = 1.0 - (rustAmount * 2.0);
//                       float adjustedPattern = smoothstep(threshold, 1.0, rustPattern);
                      
//                       vec4 rustMix = mix(
//                         darkRust,
//                         mix(midRust, lightRust, n2),
//                         n1 * n3
//                       );
                      
//                       float finalMix = rustAmount * adjustedPattern;
//                       finalMix = pow(finalMix, 1.5);
                      
//                       // Convert diffuseColor to vec4 while preserving its original alpha
//                       vec4 baseColor = vec4(diffuseColor.rgb, diffuseColor.a);
                      
//                       // Only mix the rust effect where it's not transparent
//                       diffuseColor = mix(baseColor, rustMix, finalMix * rustMix.a);
//                       // Preserve the original texture's alpha
//                       diffuseColor.a = baseColor.a;
//                       `
//                     );
            
//                     // Modify metalness and roughness
//                     shader.fragmentShader = shader.fragmentShader.replace(
//                       '#include <roughnessmap_fragment>',
//                       `
//                       #include <roughnessmap_fragment>
//                       roughnessFactor = mix(roughnessFactor, 1.0, finalMix);
//                       `
//                     );
            
//                     shader.fragmentShader = shader.fragmentShader.replace(
//                       '#include <metalnessmap_fragment>',
//                       `
//                       #include <metalnessmap_fragment>
//                       metalnessFactor *= (1.0 - finalMix);
//                       `
//                     );
            
//                     material.userData.shader = shader;
//                   };
//                 material.needsUpdate = true;
//                 return material;
//               };
    
//             // Create Moss Material
//             const createPhysicalShaderMaterial2 = (shader, baseMaterial) => {
//                 const material = new THREE.MeshPhysicalMaterial({
//                     map: baseMaterial.map,
//                     metalness: 0.8,
//                     roughness: 0,
//                     clearcoat: 0.3,
//                     clearcoatRoughness: 0.25,
//                     transparent: true,
//                     opacity: 1,
//                     blending: THREE.NormalBlending,
//                   });
          
//                   material.onBeforeCompile = (shader) => {
//                     shader.uniforms.rustAmount = { value: 0.0 };
//                     shader.uniforms.noiseScale = { value: 9.0 };
//                     shader.uniforms.baseTexture = { value: baseMaterial.map };
            
//                     // Vertex shader modifications remain the same
//                     shader.vertexShader = shader.vertexShader.replace(
//                       '#include <common>',
//                       `
//                       #include <common>
//                       varying vec2 vUvRust;
//                       `
//                     );
            
//                     shader.vertexShader = shader.vertexShader.replace(
//                       '#include <begin_vertex>',
//                       `
//                       #include <begin_vertex>
//                       vUvRust = uv;
//                       `
//                     );
            
//                     // Fragment shader modifications
//                     shader.fragmentShader = shader.fragmentShader.replace(
//                       '#include <common>',
//                       `
//                       #include <common>
//                       uniform float rustAmount;
//                       uniform float noiseScale;
//                       uniform sampler2D baseTexture;
//                       varying vec2 vUvRust;
            
//                       float hash(vec2 p) {
//                         p = fract(p * vec2(234.34, 435.345));
//                         p += dot(p, p + 34.23);
//                         return fract(p.x * p.y);
//                       }
                    
//                       float noise(vec2 p) {
//                         vec2 i = floor(p);
//                         vec2 f = fract(p);
//                         float a = hash(i);
//                         float b = hash(i + vec2(1.0, 0.0));
//                         float c = hash(i + vec2(0.0, 1.0));
//                         float d = hash(i + vec2(1.0, 1.0));
//                         f = f * f * (3.0 - 2.0 * f);
//                         return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
//                       }
                    
//                       float fbm(vec2 p) {
//                         float value = 0.0;
//                         float amplitude = 0.5;
//                         float frequency = 1.0;
//                         for(int i = 0; i < 8; i++) {
//                           value += amplitude * noise(p * frequency);
//                           frequency *= 2.2;
//                           amplitude *= 0.6;
//                         }
//                         return value;
//                       }
//                       `
//                     );
            
//                     shader.fragmentShader = shader.fragmentShader.replace(
//                       '#include <color_fragment>',
//                       `
//                       #include <color_fragment>
                      
//                       vec2 uv = vUvRust * noiseScale;
//                       float n1 = fbm(uv * 2.0);
//                       float n2 = fbm(uv * 4.0 + vec2(5.2, 1.3));
//                       float n3 = fbm(uv * 8.0 + vec2(9.4, 2.6));
                      
//                       float rustPattern = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2) * 1.5;
//                       rustPattern = pow(rustPattern, 0.7);
                      
//                       vec4 darkRust = vec4(0.82, 0.75, 0.55, 1.0);    // Light sand
//                       vec4 midRust = vec4(0.72, 0.62, 0.42, 0.71);     // Medium sand (transparent)
//                       vec4 lightRust = vec4(0.58, 0.48, 0.28, 0.30);   // Dark sand
                      
//                       float threshold = 1.0 - (rustAmount * 2.0);
//                       float adjustedPattern = smoothstep(threshold, 1.0, rustPattern);
                      
//                       vec4 rustMix = mix(
//                         darkRust,
//                         mix(midRust, lightRust, n2),
//                         n1 * n3
//                       );
                      
//                       float finalMix = rustAmount * adjustedPattern;
//                       finalMix = pow(finalMix, 1.5);
                      
//                       // Convert diffuseColor to vec4 while preserving its original alpha
//                       vec4 baseColor = vec4(diffuseColor.rgb, diffuseColor.a);
                      
//                       // Only mix the rust effect where it's not transparent
//                       diffuseColor = mix(baseColor, rustMix, finalMix * rustMix.a);
//                       // Preserve the original texture's alpha
//                       diffuseColor.a = baseColor.a;
//                       `
//                     );
            
//                     // Modify metalness and roughness
//                     shader.fragmentShader = shader.fragmentShader.replace(
//                       '#include <roughnessmap_fragment>',
//                       `
//                       #include <roughnessmap_fragment>
//                       roughnessFactor = mix(roughnessFactor, 1.0, finalMix);
//                       `
//                     );
            
//                     shader.fragmentShader = shader.fragmentShader.replace(
//                       '#include <metalnessmap_fragment>',
//                       `
//                       #include <metalnessmap_fragment>
//                       metalnessFactor *= (1.0 - finalMix);
//                       `
//                     );
            
//                     material.userData.shader = shader;
//                   };
//                 material.needsUpdate = true;
//                 return material;
//               };
//             // Create both materials
//             fenceMaterialRef.current = createPhysicalShaderMaterial(RustShaderCircle, materials['Material.002']);
//             pillarMaterialRef.current = createPhysicalShaderMaterial2(BridgeRustShader, materials['Scene_-_Root']);
//         }
//     }, [materials]);
    
//       useFrame(() => {
//         if (fenceMaterialRef.current?.userData.shader) {
//           const rustAmount = (year - 2000) / 20;
//           fenceMaterialRef.current.userData.shader.uniforms.rustAmount.value = rustAmount * 1.21;
//         }
//         if (pillarMaterialRef.current?.userData.shader) {
//             const rustAmount = (year - 2000) / 20;
//             pillarMaterialRef.current.userData.shader.uniforms.rustAmount.value = rustAmount * 1.21;
//         }
//       });

//       return (
//         <group dispose={null} scale={0.5}>
//         <mesh
//           castShadow
//           receiveShadow
//           geometry={nodes.lightstand.geometry}
//           material={materials.Material}
//           position={[-13.003, 0, -281.684]}
//           rotation={[-Math.PI / 2, 0.008, -Math.PI / 2]}
//           scale={0.001}
//         />
//         <mesh
//           castShadow
//           receiveShadow
//           geometry={nodes.road.geometry}
//           material={materials['road_road_0016_01_tiled.001']}
//           position={[-13.003, 0, -281.684]}
//           rotation={[-Math.PI / 2, 0.008, -Math.PI / 2]}
//           scale={0.001}
//         />
//     <mesh
//         castShadow
//         receiveShadow
//         geometry={nodes.fence.geometry}
//         material={fenceMaterialRef.current || materials['Material.002']}
//         position={[-13.003, 0, -281.684]}
//         rotation={[-Math.PI / 2, 0.008, -Math.PI / 2]}
//         scale={0.001}
//       />
//          <mesh
//                 castShadow
//                 receiveShadow
//                 geometry={nodes.rectpillar.geometry}
//                 material={pillarMaterialRef.current || materials['Scene_-_Root']}
//                 position={[-13.003, 0, -281.684]}
//                 rotation={[-Math.PI / 2, 0.008, -Math.PI / 2]}
//                 scale={0.001}
//             />
//         <mesh
//           castShadow
//           receiveShadow
//           geometry={nodes.light.geometry}
//           material={materials['Material.001']}
//           position={[-13.003, 0, -281.684]}
//           rotation={[-Math.PI / 2, 0.008, -Math.PI / 2]}
//           scale={0.001}
//         />
//       </group>
//       );
// }

// const BridgeScene = () => {
//   const [year, setYear] = useState(2000);

//   const handleYearChange = (event) => {
//     const value = parseFloat(event.target.value);
//     setYear(Number(value.toFixed(1)));
//   };

//   return (
//     <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
//       <Canvas
//         shadows
//         camera={{ 
//           position: [-10, 40, -18],
//           fov: 75,
//           near: 0.01,
//           far: 10000
//         }}
//       >
//         {/* <ambientLight intensity={0.5} />
//         <directionalLight
//           position={[5, 5, 5]}
//           castShadow
//           intensity={1}
//           shadow-mapSize-width={1024}
//           shadow-mapSize-height={1024}
//         /> */}
//         <Model year={year} />
//         <OrbitControls 
//           enablePan={true}
//           enableZoom={true}
//           enableRotate={true}
//           maxDistance={50}
//           minDistance={2}
//         />
//         <Environment
//           files="/derelict_highway_midday_2k.hdr"
//           background={false}
//           blur={0.5}
//         />
//       </Canvas>

//       <div
//         style={{
//           position: 'absolute',
//           bottom: '20px',
//           left: '50%',
//           transform: 'translateX(-50%)',
//           width: '80%',
//           maxWidth: '600px',
//           background: 'rgba(0, 0, 0, 0.7)',
//           padding: '20px',
//           borderRadius: '10px',
//           color: 'white',
//         }}
//       >
//         <div style={{ 
//           display: 'flex', 
//           flexDirection: 'column', 
//           gap: '10px',
//           alignItems: 'center' 
//         }}>
//           <span>Year: {year.toFixed(1)}</span>
//           <input
//             type="range"
//             min={2000}
//             max={2020}
//             value={year}
//             step="0.1"
//             onChange={handleYearChange}
//             style={{
//               width: '100%',
//               height: '20px',
//               borderRadius: '10px',
//               cursor: 'pointer',
//               WebkitAppearance: 'none',
//               background: `linear-gradient(to right, 
//                 #4CAF50 0%, 
//                 #4CAF50 ${((year - 2000) / 20) * 100}%, 
//                 #ddd ${((year - 2000) / 20) * 100}%, 
//                 #ddd 100%)`,
//             }}
//           />
//           <div style={{ 
//             display: 'flex', 
//             justifyContent: 'space-between', 
//             width: '100%',
//             fontSize: '0.8rem' 
//           }}>
//             <span>2000</span>
//             <span>2005</span>
//             <span>2010</span>
//             <span>2015</span>
//             <span>2020</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// useGLTF.preload('/Bridge.glb');

// export default BridgeScene;

import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF, PerspectiveCamera, Stage } from '@react-three/drei';
import * as THREE from 'three';

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
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            <circleGeometry args={[0.3, 32]} />
            <meshBasicMaterial
              color={hovered ? "#ff4444" : "#ffffff"}
              transparent
              opacity={0.8}
            />
          </mesh>
          <sprite
            position={[0, 0.5, 0]}
            scale={[2, 1, 1]}
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
        position: [-13.003, 2, -281.684],
        label: "Fence Damage",
        description: "Severe rust damage on the bridge fence",
        image: "/hotspot1.jpg"
      },
      {
        id: 2,
        position: [-5, 0, -140],
        label: "Road Cracks",
        description: "Deep cracks forming in the road surface",
        image: "/hotspot2.jpg"
      },
      {
        id: 3,
        position: [-5, 4, -140],
        label: "Light Failure",
        description: "Street light showing signs of deterioration",
        image: "/hotspot3.jpg"
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
                    metalness: 0.81,
                    roughness: 0.62,
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
vec4 midRust = vec4(0.0,0.0,0.0, 1.0);    // Darker mid toneA
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
                float crackThreshold = 1.0 - crackAmount * 0.34;
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
                float ao = 3.4 - (vDisplacement * 1.05);
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
        metalness: 0.18,
        roughness: 0.82,
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
                float amplitude = 0.5;
                float frequency = 1.0;
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
      vec4 darkColor = vec4(0.05, 0.08, 0.04, 0.85);    // Very dark moss green, almost black
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
    return (
      <div style={{
        position: 'absolute',
        left: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '10px',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <button 
          onClick={() => setControlMode('orbit')}
          style={{
            padding: '10px',
            background: controlMode === 'orbit' ? '#4CAF50' : '#333',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Orbit
        </button>
        <button 
          onClick={() => setControlMode('pan')}
          style={{
            padding: '10px',
            background: controlMode === 'pan' ? '#4CAF50' : '#333',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Pan
        </button>
        <button 
          onClick={() => setControlMode('zoom')}
          style={{
            padding: '10px',
            background: controlMode === 'zoom' ? '#4CAF50' : '#333',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Zoom
        </button>
      </div>
    );
  };
  
  const LayerPanel = ({ resetCamera }) => {
    const [selectedHotspot, setSelectedHotspot] = useState(null);
  
    const hotspots = [
      { id: 1, name: 'Hotspot 1', position: [0, 0, 0] },
      { id: 2, name: 'Hotspot 2', position: [2, 2, 0] },
      // Add more hotspots as needed
    ];
  
    return (
      <div style={{
        position: 'absolute',
        right: '20px',
        top: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '20px',
        borderRadius: '10px',
        color: 'white',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <button 
          onClick={resetCamera}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '20px',
            background: '#4CAF50',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Reset View
        </button>
        
        <h3>Layers</h3>
        <div style={{ marginTop: '10px' }}>
          {['Road', 'Fence', 'Pillars', 'Lights'].map(layer => (
            <div key={layer} style={{
              padding: '8px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <input type="checkbox" defaultChecked />
              <span>{layer}</span>
            </div>
          ))}
        </div>
  
        {selectedHotspot && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            zIndex: 1000
          }}>
            <button 
              onClick={() => setSelectedHotspot(null)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
            <h3>{selectedHotspot.name}</h3>
            <div style={{ width: '300px', height: '200px', background: '#eee' }}>
              Image Placeholder
            </div>
            <p>Description text goes here...</p>
          </div>
        )}
      </div>
    );
  };
  const CustomControls = ({ controlMode }) => {
    const { camera, gl: { domElement } } = useThree();
    const controls = useRef();
  
    // Remove this useEffect that was resetting the camera
    // useEffect(() => {
    //   if (controls.current) {
    //     controls.current.reset();
    //   }
    // }, [controlMode]);
  
    useFrame(() => {
      if (controls.current) {
        controls.current.update();
      }
    });
  
    return (
      <OrbitControls
        ref={controls}
        args={[camera, domElement]}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        mouseButtons={{
          LEFT: controlMode === 'orbit' 
            ? THREE.MOUSE.ROTATE 
            : controlMode === 'pan' 
              ? THREE.MOUSE.PAN 
              : THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN
        }}
        enableDamping={true}
        dampingFactor={0.05}
        enabled={true}
        rotateSpeed={controlMode === 'orbit' ? 1 : 0}
        zoomSpeed={controlMode === 'zoom' ? 1 : 0.5}
        panSpeed={controlMode === 'pan' ? 2 : 1}
        enableZoom={controlMode === 'zoom' || controlMode === 'orbit'}
        enableRotate={controlMode === 'orbit'}
      />
    );
  };
const BridgeScene = () => {
    const [year, setYear] = useState(2000);
    const [controlMode, setControlMode] = useState('orbit');
    const cameraRef = useRef();
    const [selectedHotspot, setSelectedHotspot] = useState(null);
    const handleYearChange = (event) => {
        const value = parseFloat(event.target.value);
        setYear(Math.round(value));
    };
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
                    position: [-10, 40, -18],
                    fov: 75,
                    near: 0.01,
                    far: 10000
                }}
            >
                <Environment 
                    files="/derelict_highway_midday_2k.hdr"
                    background={true}
                    blur={100}
                    preset={null}
                    environmentIntensity={.8921}
                />
                 <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
<Stage environment={null}>
<Model year={year} setSelectedHotspot={setSelectedHotspot} />
</Stage>
              
                {/* <OrbitControls 
          enablePan={controlMode === 'pan'}
          enableZoom={controlMode === 'zoom' || controlMode === 'orbit'}
          enableRotate={controlMode === 'orbit'}
          maxDistance={500}
          minDistance={1}
        /> */}
        <CustomControls controlMode={controlMode} />
            </Canvas>
            {selectedHotspot && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          zIndex: 1000,
          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
          maxWidth: '500px',
          width: '90%'
        }}>
          <button 
            onClick={() => setSelectedHotspot(null)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '10px',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
          <h3>{selectedHotspot.label}</h3>
          <div style={{
            width: '100%',
            height: '200px',
            background: '#eee',
            marginBottom: '15px',
            backgroundImage: `url(${selectedHotspot.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '5px'
          }} />
          <p>{selectedHotspot.description}</p>
        </div>
      )}

            <ControlPanel setControlMode={setControlMode} controlMode={controlMode} />
            <LayerPanel resetCamera={resetCamera} />
            <div
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
