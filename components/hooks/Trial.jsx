import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Create square particle texture
function createSquareParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Create a square with soft edges
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgb(255, 255, 255)');
    gradient.addColorStop(0.7, 'rgb(255, 255, 255)');
    gradient.addColorStop(0.9, 'rgb(255, 255, 255)');
    gradient.addColorStop(1, 'rgb(255, 255, 255)');
    
    // Draw square with gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(3, 3, 24, 24); // Square instead of circle
    
    return new THREE.CanvasTexture(canvas);
}

// Enhanced particle shader with blue fragment effects
const createBlueParticleShader = (texture) => ({
    uniforms: {
        time: { value: 0 },
        pointTexture: { value: texture },
        mousePosition: { value: new THREE.Vector3() },
        repulsionRadius: { value: 1.0 },
        repulsionStrength: { value: 0.25 },
        u_resolution: { value: new THREE.Vector2(512, 512) },
        u_intensity: { value: 1.0 }
    },
    vertexShader: `
        attribute float size;
        attribute vec3 originalPosition;
        varying vec3 vColor;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vIntensity;
        uniform float time;
        
        // Noise function for blue squares effect
        float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        float smoothNoise(vec2 p) {
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            
            float a = noise(floor(p));
            float b = noise(floor(p) + vec2(1.0, 0.0));
            float c = noise(floor(p) + vec2(0.0, 1.0));
            float d = noise(floor(p) + vec2(1.0, 1.0));
            
            return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }
        
        void main() {
            vColor = color;
            vPosition = position;
            
            // Create UV coordinates based on position
            vUv = (originalPosition.xy + 1.0) * 0.5;
            
            // Calculate blue squares effect intensity
            vec2 wavePos1 = vUv * 3.0 + vec2(sin(time * 0.3) * 2.0, cos(time * 0.25) * 3.0);
            vec2 wavePos2 = vUv * 2.5 + vec2(cos(time * 0.35) * 1.8, sin(time * 0.3) * 1.2);
            
            float island1 = smoothNoise(wavePos1);
            float island2 = smoothNoise(wavePos2);
            float combinedIslands = island1 * 0.5 + island2 * 0.5;
            
            vIntensity = smoothstep(0.3, 0.9, combinedIslands);
            
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            
            // Dynamic particle size based on blue squares effect
            float dynamicSize = size * (800.0 + vIntensity * 200.0);
            gl_PointSize = dynamicSize / -mvPosition.z;
            
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec2 mousePosition;
        uniform vec2 u_resolution;
        uniform float u_intensity;
        uniform sampler2D pointTexture;
        
        varying vec3 vColor;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vIntensity;
        
        // Blue squares shader functions
        float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        float smoothNoise(vec2 p) {
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            
            float a = noise(floor(p));
            float b = noise(floor(p) + vec2(1.0, 0.0));
            float c = noise(floor(p) + vec2(0.0, 1.0));
            float d = noise(floor(p) + vec2(1.0, 1.0));
            
            return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }
        
        float squareDistance(vec2 p, vec2 center, float size) {
            vec2 d = abs(p - center) - size;
            return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
        }
        
        void main() {
            vec2 uv = gl_PointCoord;
            vec4 texColor = texture2D(pointTexture, uv);
            
            // Apply blue squares effect to each particle
            vec2 pixelPos = vUv * u_resolution;
            float gridSpacing = 1.0;
            vec2 gridCell = floor(pixelPos / gridSpacing);
            vec2 cellCenter = (gridCell + 0.5) * gridSpacing;
            
            float distToSquare = squareDistance(pixelPos, cellCenter, 3.0);
            
            // Moving patterns
            vec2 wavePos1 = vUv * 3.0 + vec2(sin(time * 0.3) * 2.0, cos(time * 0.25) * 3.0);
            vec2 wavePos2 = vUv * 2.5 + vec2(cos(time * 0.35) * 1.8, sin(time * 0.3) * 1.2);
            vec2 wavePos3 = vUv * 4.0 + vec2(sin(time * 0.2) * 1.0, cos(time * 0.15) * 0.8);
            
            float island1 = smoothNoise(wavePos1);
            float island2 = smoothNoise(wavePos2);
            float island3 = smoothNoise(wavePos3);
            
            float combinedIslands = island1 * 0.4 + island2 * 0.35 + island3 * 0.25;
            combinedIslands = smoothstep(0.3, 0.9, combinedIslands);
            
            // Scan line effect
            float scanLine = sin(vUv.y * u_resolution.y * 0.8 + time * 1.5) * 0.1 + 1.0;
            
            // Retro wave
            float retroWave = sin(vUv.x * 6.0 + time * 2.0) * sin(vUv.y * 4.0 + time * 0.8);
            retroWave = retroWave * 0.3 + 0.7;
            
            // Moving hotspots
            vec2 center1 = vec2(0.5 + 0.3 * sin(time * 0.3), 0.5 + 0.3 * cos(time * 0.3));
            vec2 center2 = vec2(0.5 + 0.25 * cos(time * 0.45 + 2.0), 0.5 + 0.25 * sin(time * 0.45 + 2.0));
            
            float dist1 = 1.0 - smoothstep(0.1, 0.5, distance(vUv, center1));
            float dist2 = 1.0 - smoothstep(0.1, 0.4, distance(vUv, center2));
            
            float movingHotspots = max(dist1, dist2 * 0.8);
            
            float baseIllumination = 0.15;
            float islandIntensity = combinedIslands * 0.7 + movingHotspots * 0.6 + baseIllumination;
            islandIntensity *= retroWave * scanLine;
            
            // Glow layers
            float coreGlow = (1.0 - smoothstep(0.0, 2.0, distToSquare)) * islandIntensity;
            float midGlow = (1.0 - smoothstep(0.0, 5.0, distToSquare)) * islandIntensity * 0.6;
            float outerGlow = (1.0 - smoothstep(0.0, 10.0, distToSquare)) * islandIntensity * 0.3;
            
            float totalIntensity = coreGlow + midGlow + outerGlow;
            totalIntensity = clamp(totalIntensity, 0.0, 3.0) * u_intensity;
            
            // Blue color palette
            vec3 darkBlue = vec3(0.05, 0.1, 0.3);
            vec3 baseBlue = vec3(0.1, 0.3, 0.7);
            vec3 brightBlue = vec3(0.2, 0.6, 1.0);
            vec3 hotCyan = vec3(0.4, 0.8, 1.0);
            vec3 whiteCyan = vec3(0.7, 0.9, 1.0);
            
            vec3 finalColor = darkBlue;
            finalColor = mix(finalColor, baseBlue, smoothstep(0.1, 0.3, totalIntensity));
            finalColor = mix(finalColor, brightBlue, smoothstep(0.3, 0.6, totalIntensity));
            finalColor = mix(finalColor, hotCyan, smoothstep(0.6, 0.9, totalIntensity));
            finalColor = mix(finalColor, whiteCyan, smoothstep(0.9, 1.2, totalIntensity));
            
            finalColor *= (0.8 + totalIntensity * 0.7);
            
            // Combine with particle texture
            vec3 particleColor = mix(vColor, finalColor, 0.8);
            float alpha = texColor.a * (0.7 + totalIntensity * 0.3);
            
            gl_FragColor = vec4(particleColor, alpha);
        }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
});

function LogoParticleSystem() {
    const { scene } = useGLTF('/logo.glb');
    const groupRef = useRef();
    const [particleSystems, setParticleSystems] = useState([]);
    const [isAssembling, setIsAssembling] = useState(true);
    const [assemblyProgress, setAssemblyProgress] = useState(0);
    const [assemblyComplete, setAssemblyComplete] = useState(false);
    const { camera, mouse } = useThree();
    
    // Create square particle texture
    const particleTexture = useMemo(() => createSquareParticleTexture(), []);
    
    // Extract particles from model with assembly animation
    const processedParticles = useMemo(() => {
        if (!scene) return [];
        
        const systems = [];
        
        scene.traverse((node) => {
            if (node.isMesh && node.geometry) {
                console.log('Processing mesh:', node.name);
                
                const geometry = node.geometry;
                const particleCount = geometry.attributes.position.count * 2;
                
                const positions = new Float32Array(particleCount * 3);
                const originalPositions = new Float32Array(particleCount * 3);
                const scatteredPositions = new Float32Array(particleCount * 3);
                const colors = new Float32Array(particleCount * 3);
                const sizes = new Float32Array(particleCount);
                
                // Initialize particles
                for(let i = 0; i < particleCount; i++) {
                    const vertexIndex = i % geometry.attributes.position.count;
                    
                    const baseX = geometry.attributes.position.array[vertexIndex * 3];
                    const baseY = geometry.attributes.position.array[vertexIndex * 3 + 1];
                    const baseZ = geometry.attributes.position.array[vertexIndex * 3 + 2];
                    
                    const vertex = new THREE.Vector3(baseX, baseY, baseZ);
                    vertex.applyMatrix4(node.matrixWorld);
                    
                    const i3 = i * 3;
                    
                    // Store original (target) positions - exact vertex positions for perfect assembly
                    originalPositions[i3] = vertex.x;
                    originalPositions[i3 + 1] = vertex.y;
                    originalPositions[i3 + 2] = vertex.z;
                    
                    // Create scattered starting positions
                    const scatterRadius = 10;
                    scatteredPositions[i3] = originalPositions[i3] + (Math.random() - 0.5) * scatterRadius;
                    scatteredPositions[i3 + 1] = originalPositions[i3 + 1] + (Math.random() - 0.5) * scatterRadius;
                    scatteredPositions[i3 + 2] = originalPositions[i3 + 2] + (Math.random() - 0.5) * scatterRadius;
                    
                    // Start at scattered positions
                    positions[i3] = scatteredPositions[i3];
                    positions[i3 + 1] = scatteredPositions[i3 + 1];
                    positions[i3 + 2] = scatteredPositions[i3 + 2];
                    
                    // Blue color theme
                    colors[i3] = 0.2 + Math.random() * 0.3;  // R
                    colors[i3 + 1] = 0.6 + Math.random() * 0.4;  // G
                    colors[i3 + 2] = 1.0;  // B (full blue)
                    
                    sizes[i] = 0.03 + Math.random() * 0.02;
                }
                
                // Create particle geometry
                const particleGeometry = new THREE.BufferGeometry();
                particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                particleGeometry.setAttribute('originalPosition', new THREE.BufferAttribute(originalPositions, 3));
                particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
                particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
                
                // Create blue shader material
                const shaderConfig = createBlueParticleShader(particleTexture);
                const particleMaterial = new THREE.ShaderMaterial(shaderConfig);
                
                // Set resolution
                particleMaterial.uniforms.u_resolution.value.set(512, 512);
                
                const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
                
                // Initialize velocities and store data
                const velocities = new Float32Array(particleCount * 3).fill(0);
                particleSystem.userData = {
                    velocities: velocities,
                    originalPositions: originalPositions.slice(),
                    scatteredPositions: scatteredPositions.slice(),
                    material: particleMaterial,
                    meshName: node.name
                };
                
                systems.push(particleSystem);
                node.visible = false;
            }
        });
        
        return systems;
    }, [scene, particleTexture]);
    
    // Add particle systems to scene
    useEffect(() => {
        if (processedParticles.length > 0 && groupRef.current) {
            processedParticles.forEach(system => {
                groupRef.current.add(system);
            });
            setParticleSystems(processedParticles);
            
            return () => {
                processedParticles.forEach(system => {
                    groupRef.current?.remove(system);
                });
            };
        }
    }, [processedParticles]);
    
    // Animation loop
    useFrame((state, delta) => {
        const time = state.clock.elapsedTime;
        
        // Assembly animation
        if (isAssembling && assemblyProgress < 1) {
            const newProgress = Math.min(assemblyProgress + delta * 0.4, 1);
            setAssemblyProgress(newProgress);
            
            if (newProgress >= 0.98) {
                setIsAssembling(false);
                setAssemblyComplete(true);
            }
        }
        
        // Camera movement based on horizontal mouse position
        const cameraIntensity = 0.08;
        const targetX = mouse.x * 2.0;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, cameraIntensity);
        camera.lookAt(0, 0, 0);
        
        // Update each particle system
        particleSystems.forEach(particles => {
            if (!particles.userData) return;
            
            const positions = particles.geometry.attributes.position.array;
            const originalPositions = particles.userData.originalPositions;
            const scatteredPositions = particles.userData.scatteredPositions;
            const velocities = particles.userData.velocities;
            const material = particles.userData.material;
            
            // Update shader uniforms
            material.uniforms.time.value = time;
            material.uniforms.u_intensity.value = assemblyComplete ? 1.0 : 0.4;
            
            if (isAssembling) {
                // Assembly animation - lerp from scattered to original positions
                for(let i = 0; i < positions.length; i += 3) {
                    positions[i] = THREE.MathUtils.lerp(
                        scatteredPositions[i], 
                        originalPositions[i], 
                        assemblyProgress
                    );
                    positions[i + 1] = THREE.MathUtils.lerp(
                        scatteredPositions[i + 1], 
                        originalPositions[i + 1], 
                        assemblyProgress
                    );
                    positions[i + 2] = THREE.MathUtils.lerp(
                        scatteredPositions[i + 2], 
                        originalPositions[i + 2], 
                        assemblyProgress
                    );
                }
            } else if (assemblyComplete) {
                // Interactive behavior after assembly
                const mouseVector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
                mouseVector.unproject(camera);
                const mouseRay = mouseVector.sub(camera.position).normalize();
                
                const particleCenter = new THREE.Vector3();
                particles.getWorldPosition(particleCenter);
                const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -particleCenter.z);
                
                const mouseWorldPos = new THREE.Vector3();
                const ray = new THREE.Ray(camera.position, mouseRay);
                ray.intersectPlane(plane, mouseWorldPos);
                
                const worldMatrix = particles.matrixWorld;
                const inverseMatrix = new THREE.Matrix4().copy(worldMatrix).invert();
                
                // Update each particle
                for(let i = 0; i < positions.length; i += 3) {
                    const particlePos = new THREE.Vector3(
                        positions[i],
                        positions[i + 1],
                        positions[i + 2]
                    );
                    
                    const worldPos = particlePos.clone().applyMatrix4(worldMatrix);
                    const distanceToMouse = mouseWorldPos.distanceTo(worldPos);
                    const repulsionRadius = 1.5;
                    
                    // Mouse repulsion
                    if(distanceToMouse < repulsionRadius) {
                        const repulsion = worldPos.clone().sub(mouseWorldPos).normalize();
                        const strength = (1 - distanceToMouse / repulsionRadius) * 0.02;
                        
                        repulsion.applyMatrix4(inverseMatrix);
                        
                        velocities[i] += repulsion.x * strength;
                        velocities[i + 1] += repulsion.y * strength;
                        velocities[i + 2] += repulsion.z * strength;
                    }
                    
                    // Return to original position
                    const returnForce = 0.02;
                    velocities[i] += (originalPositions[i] - positions[i]) * returnForce;
                    velocities[i + 1] += (originalPositions[i + 1] - positions[i + 1]) * returnForce;
                    velocities[i + 2] += (originalPositions[i + 2] - positions[i + 2]) * returnForce;
                    
                    // Apply damping
                    const damping = 0.95;
                    velocities[i] *= damping;
                    velocities[i + 1] *= damping;
                    velocities[i + 2] *= damping;
                    
                    // Update positions
                    positions[i] += velocities[i];
                    positions[i + 1] += velocities[i + 1];
                    positions[i + 2] += velocities[i + 2];
                }
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
        });
    });
    
    if (!scene) return null;
    
    return (
        <group ref={groupRef} scale={[3.7, 3.7, 3.7]}>
            <primitive object={scene} />
        </group>
    );
}

function Scene() {
    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={0.4} />
            <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4080ff" />
            
            <React.Suspense fallback={
                <Text
                    position={[0, 0, 0]}
                    fontSize={1}
                    color="cyan"
                    anchorX="center"
                    anchorY="middle"
                >
                    Loading Logo...
                </Text>
            }>
                <LogoParticleSystem />
            </React.Suspense>
            
            <OrbitControls 
                enableZoom={true}
                enablePan={true}
                enableRotate={true}
                autoRotate={false}
            />
        </>
    );
}

export default function LogoGLBParticleEffect() {
    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000011' }}>
            <Canvas
                camera={{ position: [0, 0, 8], fov: 75 }}
                gl={{ 
                    antialias: true, 
                    alpha: true,
                    powerPreference: "high-performance"
                }}
            >
                <Scene />
            </Canvas>
        </div>
    );
}