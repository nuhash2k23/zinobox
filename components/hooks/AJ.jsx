import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/*
Corrected Animation Flow:
1. Disconnected: Organic blob, clicks enabled
2. Click → sets useragent to "listening"
3. Listening: Position water ripple only (no edge ripples)
4. Speaking: Circle formation + fluid ripples loop (starts at 3.5 seconds - 1.5s after circle formation)
5. No time-based transitions - all prop driven
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

// Enhanced black blob shader
const blackBlobFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uClickPos;
  uniform float uClickRippleTime;
  uniform float uStrokeWidth;
  uniform float uStrokeBlur;
  uniform int uAnimationState; // 0=disconnected, 1=listening, 2=speaking
  uniform float uEdgeRippleTime;
  uniform float uCircleProgress;
  uniform bool uHasClickRipple;
  
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
  
  // Organic blob with pulsing
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
  
  // Position-based water ripple (from click)
  float waterRipple(vec2 pos, vec2 center, float time) {
    float dist = distance(pos, center);
    
    if (time <= 0.0) return 0.0;
    
    float waveSpeed = 0.3;
    float waveRadius = time * waveSpeed;
    
    float distFromWave = dist - waveRadius;
    
    float waveLength = 0.12;
    float amplitude = 0.03;
    
    float pushPull = sin(distFromWave / waveLength * 6.28318) * amplitude;
    float envelope = exp(-abs(distFromWave) / 0.06);
    float timeDecay = exp(-time * 0.6);
    
    return pushPull * envelope * timeDecay;
  }
  
  // Fluid edge ripples - starts 1.5s after circle formation completes (3.5 seconds total) and loops continuously
  float fluidRipples(vec2 pos, float time) {
    if (time < 3.5) return 0.0; // Start 1.5s after circle formation completes
    
    float angle = atan(pos.y, pos.x);
    float adjustedTime = time - 3.5;
    
    float ripple1 = sin(angle * 8.0 + adjustedTime * 2.2) * 0.005;
    float ripple2 = sin(angle * 12.0 - adjustedTime * 2.4) * 0.005;
    float ripple3 = sin(angle * 16.0 + adjustedTime * 2.6) * 0.005;
    float ripple4 = sin(angle * 10.0 - adjustedTime * 2.1) * 0.005;
    
    float totalRipple = ripple1 + ripple2 + ripple3 + ripple4;
    
    // Fade in quickly after 1.5s delay following circle formation, then stay at full strength
    float fadeIn = smoothstep(3.5, 4.0, time);
    // No fade out - continuous loop
    
    float timeVariation = sin(adjustedTime * 0.8) * 0.1 + 0.9;
    
    return totalRipple * fadeIn * timeVariation;
  }
  
  void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 pos = vUv - center;
    
    float rippleDistortion = 0.0;
    float baseShape;
    
    // Handle different animation states
    if (uAnimationState == 0) { // Disconnected - organic blob
      baseShape = organicBlob(pos, uTime);
    }
    else if (uAnimationState == 1) { // Listening - organic blob + position ripple only
      baseShape = organicBlob(pos, uTime);
      
      // Add position-based ripple from click only
      if (uHasClickRipple) {
        rippleDistortion += waterRipple(vUv, uClickPos, uClickRippleTime);
      }
      
      // NO edge ripples for listening state
    }
    else if (uAnimationState == 2) { // Speaking - circle formation + fluid ripples
      float dist = length(pos);
      float blobDist = organicBlob(pos, uTime);
      
      // Interpolate between organic blob and circle based on progress
      baseShape = mix(blobDist, dist, uCircleProgress);
      
      // Add fluid ripples instead of edge ripples
      rippleDistortion += fluidRipples(pos, uEdgeRippleTime);
    }
    
    float distortedDist = baseShape + rippleDistortion;
    
    // Main blob rendering
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
    float shadowDist = baseShape + rippleDistortion;
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

function PinkGlowBlob() {
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

function BlackBlob({ useragent, onUseragentChange, strokeWidth = 0.035, strokeBlur = .1}) {
  const meshRef = useRef();
  const materialRef = useRef();
  const [hasScaled, setHasScaled] = useState(false);
  const [cssRipples, setCssRipples] = useState([]);
  const [clickData, setClickData] = useState({
    hasClick: false,
    clickPos: [0.5, 0.5],
    clickTime: 0
  });
  const [circleProgress, setCircleProgress] = useState(0);
  
  const startTime = useRef(null);
  const edgeRippleStartTime = useRef(null);
  const clickStartTime = useRef(null);
  const circleStartTime = useRef(null);
  const { camera, gl } = useThree();
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uClickPos: { value: new THREE.Vector2(0.5, 0.5) },
    uClickRippleTime: { value: 0 },
    uStrokeWidth: { value: strokeWidth },
    uStrokeBlur: { value: strokeBlur },
    uAnimationState: { value: 0 }, // 0=disconnected, 1=listening, 2=speaking
    uEdgeRippleTime: { value: 0 },
    uCircleProgress: { value: 0 },
    uHasClickRipple: { value: false }
  }), [strokeWidth, strokeBlur]);
  
  // Handle useragent prop changes
  useEffect(() => {
    if (useragent === 'disconnected') {
      setClickData({ hasClick: false, clickPos: [0.5, 0.5], clickTime: 0 });
      setCircleProgress(0);
      edgeRippleStartTime.current = null;
      clickStartTime.current = null;
      circleStartTime.current = null;
    } else if (useragent === 'listening') {
      // No edge ripples for listening, only position ripple handled in click
      setCircleProgress(0);
      circleStartTime.current = null;
      
      // Auto-transition to speaking after water ripple completes (3 seconds)
      const autoTransitionTimeout = setTimeout(() => {
        if (onUseragentChange) {
          onUseragentChange('speaking');
        }
      }, 3000);
      
      return () => clearTimeout(autoTransitionTimeout);
    } else if (useragent === 'speaking') {
      if (edgeRippleStartTime.current === null) {
        edgeRippleStartTime.current = Date.now();
      }
      if (circleStartTime.current === null) {
        circleStartTime.current = Date.now();
      }
    }
  }, [useragent, onUseragentChange]);
  
  const handleClick = (event) => {
    event.stopPropagation();
    
    // Only allow clicks when disconnected
    if (useragent !== 'disconnected') {
      console.log('Click disabled - useragent is', useragent);
      return;
    }
    
    const rect = gl.domElement.getBoundingClientRect();
    const screenX = (event.clientX - rect.left) / rect.width;
    const screenY = 1.0 - (event.clientY - rect.top) / rect.height;
    
    console.log('Click detected - setting to listening');
    
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
    
    // Set click data
    setClickData({
      hasClick: true,
      clickPos: [screenX, screenY],
      clickTime: 0
    });
    clickStartTime.current = Date.now();
    
    // Change useragent to listening
    if (onUseragentChange) {
      onUseragentChange('listening');
    }
  };
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uStrokeWidth.value = strokeWidth;
      materialRef.current.uniforms.uStrokeBlur.value = strokeBlur;
      
      const now = Date.now();
      
      // Handle animation states
      if (useragent === 'disconnected') {
        materialRef.current.uniforms.uAnimationState.value = 0;
        materialRef.current.uniforms.uHasClickRipple.value = false;
        materialRef.current.uniforms.uEdgeRippleTime.value = 0;
        materialRef.current.uniforms.uCircleProgress.value = 0;
      }
      else if (useragent === 'listening') {
        materialRef.current.uniforms.uAnimationState.value = 1;
        
        // Handle click ripple
        if (clickData.hasClick && clickStartTime.current) {
          const clickElapsed = (now - clickStartTime.current) / 1000;
          materialRef.current.uniforms.uHasClickRipple.value = true;
          materialRef.current.uniforms.uClickRippleTime.value = clickElapsed;
          materialRef.current.uniforms.uClickPos.value.set(clickData.clickPos[0], clickData.clickPos[1]);
        } else {
          materialRef.current.uniforms.uHasClickRipple.value = false;
        }
        
        // No edge ripples for listening state
        materialRef.current.uniforms.uEdgeRippleTime.value = 0;
        materialRef.current.uniforms.uCircleProgress.value = 0;
      }
      else if (useragent === 'speaking') {
        materialRef.current.uniforms.uAnimationState.value = 2;
        materialRef.current.uniforms.uHasClickRipple.value = false;
        
        // Handle circle formation progress
        if (circleStartTime.current) {
          const circleElapsed = (now - circleStartTime.current) / 1000;
          const circleFormationDuration = 2.0;
          const progress = Math.min(circleElapsed / circleFormationDuration, 1.0);
          
          // Smooth easing for circle formation
          const easedProgress = progress * progress * (3.0 - 2.0 * progress);
          materialRef.current.uniforms.uCircleProgress.value = easedProgress;
          setCircleProgress(easedProgress);
        }
        
        // Handle fluid ripples (using edge ripple time uniform)
        if (edgeRippleStartTime.current) {
          const rippleElapsed = (now - edgeRippleStartTime.current) / 1000;
          materialRef.current.uniforms.uEdgeRippleTime.value = rippleElapsed;
        }
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
  const [useragent, setUseragent] = useState('disconnected'); // disconnected, listening, speaking
  const [cssRipples, setCssRipples] = useState([]);
  
  const handleUseragentChange = (newState) => {
    console.log('Useragent changed to:', newState);
    setUseragent(newState);
  };

  const handleStopClick = () => {
    handleUseragentChange('disconnected');
  };

  const handleRefreshClick = () => {
    // Does nothing for now
    console.log('Refresh clicked - no action');
  };

  const handleRestartConversation = () => {
    // For now, just reset to disconnected
    handleUseragentChange('disconnected');
  };
  
  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
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
        
        .ui-container {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1000;
          gap: 16px;
        }
        
        .main-text {
          font-size: 18px;
          color: #333;
          text-align: center;
          margin-bottom: 8px;
        }
        
        .sub-text {
          font-size: 14px;
          color: #666;
          text-align: center;
        }
        
        .text-to-talk {
          text-decoration: underline;
          color: #000;
        }
        
        .action-buttons {
          display: flex;
          gap: 20px;
          align-items: center;
          margin: 12px 0;
        }
        
        .action-button {
          width: 48px;
          height: 48px;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }
        
        .action-button:hover {
          transform: scale(1.1);
        }
        
        .action-button img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .restart-link {
          color: #ff007a;
          text-decoration: underline;
          font-size: 14px;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }
        
        .restart-link:hover {
          opacity: 0.8;
        }
      `}</style>
      
      {/* Main Canvas */}
      <Canvas
        style={{ 
          height: '100vh', 
          width: '100%', 
          background: '#f0f0f0',
          cursor: useragent === 'disconnected' ? 'pointer' : 'default'
        }}
        camera={{ position: [0, 0, 10], fov: 75 }}
      >
        <PinkGlowBlob />
        <BlackBlob 
          useragent={useragent}
          onUseragentChange={handleUseragentChange}
          strokeWidth={strokeWidth} 
          strokeBlur={strokeBlur} 
        />
      </Canvas>
      
      {/* UI Container Below Blob */}
      <div className="ui-container">
        <div className="main-text">
          Tap and talk to begin
        </div>
        
        <div className="sub-text">
          Unable to talk and/or listen? <span className="text-to-talk">Text to talk</span>.
        </div>
        
        <div className="action-buttons">
          <button className="action-button" onClick={handleStopClick} title="Stop">
                    <img src='/stop.png'/>
          </button>
          
          <button className="action-button" onClick={handleRefreshClick} title="Refresh">
         <img src='/refresh.png'/>
          </button>
        </div>
        
        <div className="restart-link" onClick={handleRestartConversation}>
          Restart Conversation
        </div>
      </div>
      
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