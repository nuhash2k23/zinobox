import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

const vertexShader = `
  uniform float u_time;
  uniform float u_rippleTime;
  uniform vec3 u_rippleCenter;
  uniform float u_audioLevel;
  uniform float u_audioFreq[64];
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vec3 pos = position;
    vec3 norm = normal;
    
    // Audio displacement on sides (Y and Z mainly)
    float audioDisplacement = 0.0;
    if (u_audioLevel > 0.1) {
      // Create islands based on audio frequency data
      float freq1 = u_audioFreq[4] * 0.3;
      float freq2 = u_audioFreq[12] * 0.25;
      float freq3 = u_audioFreq[20] * 0.2;
      
      // Displacement along Y and Z axes for side islands
      audioDisplacement = (freq1 * abs(norm.y) + freq2 * abs(norm.z) + freq3 * abs(norm.x)) * 0.8;
      audioDisplacement *= smoothstep(0.1, 0.8, abs(norm.y) + abs(norm.z));
    }
    
    // Ripple effect
    float rippleEffect = 0.0;
    if (u_rippleTime > 0.0) {
      float dist = distance(pos, u_rippleCenter);
      float ripple = sin(dist * 10.0 - u_rippleTime * 15.0) * exp(-u_rippleTime * 2.0);
      rippleEffect = ripple * 0.1;
    }
    
    // Combine displacements
    pos += norm * (audioDisplacement + rippleEffect);
    
    vNormal = norm;
    vPosition = pos;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float u_time;
  uniform float u_glowIntensity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vec3 normal = normalize(vNormal);
    
    // Matte black base color
    vec3 baseColor = vec3(0.05, 0.05, 0.05);
    
    // Pink glow effect
    float fresnel = 1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0)));
    fresnel = pow(fresnel, 2.0);
    
    vec3 glowColor = vec3(1.0, 0.4, 0.7) * fresnel * u_glowIntensity;
    
    vec3 finalColor = baseColor + glowColor;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function AudioBlob() {
  const meshRef = useRef();
  const materialRef = useRef();
  const { camera } = useThree();
  
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [dataArray, setDataArray] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  
  const rippleTimeRef = useRef(0);
  const rippleCenterRef = useRef(new THREE.Vector3(0, 0, 0));

  // Initialize microphone
  const initMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const source = context.createMediaStreamSource(stream);
      const analyserNode = context.createAnalyser();
      
      analyserNode.fftSize = 128;
      source.connect(analyserNode);
      
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArrayBuffer = new Uint8Array(bufferLength);
      
      setAudioContext(context);
      setAnalyser(analyserNode);
      setDataArray(dataArrayBuffer);
    } catch (err) {
      console.log('Microphone access denied:', err);
    }
  }, []);

  // Handle click/tap for ripple effect
  const handleInteraction = useCallback((event) => {
    setLastInteraction(Date.now());
    
    // Get click position in world coordinates
    const rect = event.target.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 2 - 1;
    const y = -(event.clientY - rect.top) / rect.height * 2 + 1;
    
    const vector = new THREE.Vector3(x, y, 0.5);
    vector.unproject(camera);
    
    rippleCenterRef.current.copy(vector);
    rippleTimeRef.current = 0.1;
    
    // Animate ripple
    gsap.to(rippleTimeRef, {
      current: 3.0,
      duration: 2.0,
      ease: "power2.out",
      onComplete: () => {
        rippleTimeRef.current = 0;
      }
    });
  }, [camera]);

  // Initial setup
  useEffect(() => {
    initMicrophone();
    
    // Initial scale animation
    if (meshRef.current) {
      meshRef.current.scale.setScalar(0);
      gsap.to(meshRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 2,
        ease: "back.out(1.7)"
      });
    }
    
    // Glow animation
    if (materialRef.current) {
      gsap.to(materialRef.current.uniforms.u_glowIntensity, {
        value: 1.0,
        duration: 3,
        ease: "power2.out"
      });
    }
  }, [initMicrophone]);

  // Check for inactivity and start listening
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastInteraction = Date.now() - lastInteraction;
      if (timeSinceLastInteraction > 5000 && !isListening && analyser) {
        setIsListening(true);
      } else if (timeSinceLastInteraction <= 5000 && isListening) {
        setIsListening(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastInteraction, isListening, analyser]);

  // Animation loop
  useFrame((state) => {
    if (!materialRef.current) return;
    
    const time = state.clock.getElapsedTime();
    materialRef.current.uniforms.u_time.value = time;
    materialRef.current.uniforms.u_rippleTime.value = rippleTimeRef.current;
    materialRef.current.uniforms.u_rippleCenter.value = rippleCenterRef.current;
    
    // Audio analysis
    if (analyser && dataArray && isListening) {
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate audio level
      const audioLevel = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length / 255;
      materialRef.current.uniforms.u_audioLevel.value = audioLevel;
      
      // Update frequency array for shader
      const freqArray = new Array(64).fill(0);
      for (let i = 0; i < Math.min(64, dataArray.length); i++) {
        freqArray[i] = dataArray[i] / 255;
      }
      materialRef.current.uniforms.u_audioFreq.value = freqArray;
    } else {
      materialRef.current.uniforms.u_audioLevel.value = 0;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      onClick={handleInteraction}
      onPointerDown={handleInteraction}
    >
      <icosahedronGeometry args={[1.5, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          u_time: { value: 0 },
          u_rippleTime: { value: 0 },
          u_rippleCenter: { value: new THREE.Vector3(0, 0, 0) },
          u_audioLevel: { value: 0 },
          u_audioFreq: { value: new Array(64).fill(0) },
          u_glowIntensity: { value: 0 }
        }}
      />
    </mesh>
  );
}

export default function InteractiveBlobVisualization() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'whitesmoke' }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.2} />
        <AudioBlob />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}