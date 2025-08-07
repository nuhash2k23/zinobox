import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// --- Vertex Shader (kept intact) ---
const vertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// --- Pink Glow Fragment Shader (kept intact) ---
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

// --- Modified Black Blob Fragment Shader with Fractioned Circle ---
const blackBlobFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uClickPos;
  uniform float uClickRippleTime;
  uniform float uStrokeWidth;
  uniform float uStrokeBlur;
  uniform int uAnimationState; // 0=disconnected, 1=listening, 2=speaking, 3=transitioning
  uniform float uEdgeRippleTime;
  uniform float uCircleProgress;
  uniform float uTransitionProgress;
  uniform bool uHasClickRipple;
  uniform bool uFromSpeaking; // Track if transitioning from speaking to listening
  uniform bool uTransitioningFromSpeaking; // Track if transitioning from speaking (vs from listening)
  uniform float uFluidRippleStrength; // Uniform for smoother ripple control
  uniform float uBlobRadius; // Dynamic blob radius for relative shadow sizing
  
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
  
  // NEW: Fractioned circle - circle with subtle organic distortions
  float fractionedCircle(vec2 pos, float time) {
    float angle = atan(pos.y, pos.x);
    float dist = length(pos);
    
    // Much smaller organic distortions - very subtle
    float bump1 = sin(angle * 4.0) * sin(time * 1.5) * 0.002;
    float bump2 = cos(angle * 6.0) * cos(time * 1.2) * 0.0015;
    float bump3 = sin(angle * 8.0) * sin(time * 0.9) * 0.001;
    float bump4 = cos(angle * 5.0) * cos(time * 1.8) * 0.0018;
    float subtlePulse = sin(time * 1.1) * 0.0008;
    
    return dist - (bump1 + bump2 + bump3 + bump4 + subtlePulse);
  }
  
  // Position-based water ripple (from click) - completes in 1 second
  float waterRipple(vec2 pos, vec2 center, float time) {
    float dist = distance(pos, center);
    
    if (time <= 0.0) return 0.0;
    
    float waveSpeed = 0.462;
    float waveRadius = time * waveSpeed * 1.1;
    
    float distFromWave = dist - waveRadius;
    
    float waveLength = 0.12;
    float amplitude = 0.05;
    
    float pushPull = sin(distFromWave / waveLength * 6.28318) * amplitude;
    float envelope = exp(-abs(distFromWave) / 0.08);
    float timeDecay = exp(-time * 1.0);
    
    return pushPull * envelope * timeDecay;
  }
  
  // Fluid edge ripples
  float fluidRipples(vec2 pos, float time) {
    if (time < 0.0) return 0.0;
    
    float angle = atan(pos.y, pos.x);
    float adjustedTime = time;
    
    float ripple1 = sin(angle * 8.0 + adjustedTime * 2.2) * 0.005;
    float ripple2 = sin(angle * 12.0 - adjustedTime * 2.4) * 0.005;
    float ripple3 = sin(angle * 16.0 + adjustedTime * 2.6) * 0.005;
    float ripple4 = sin(angle * 10.0 - adjustedTime * 2.1) * 0.005;
    
    float totalRipple = ripple1 + ripple2 + ripple3 + ripple4;
    
    float timeVariation = sin(adjustedTime * 0.8) * 0.1 + 0.9;
    
    return totalRipple * timeVariation;
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
    else if (uAnimationState == 1) { // Listening - fractioned circle + position ripple + morphing
      float dist = length(pos);
      float blobDist = organicBlob(pos, uTime);
      float fractionedDist = fractionedCircle(pos, uTime);
      
      // Add position-based ripple from click (if applicable)
      if (uHasClickRipple) {
        rippleDistortion += waterRipple(vUv, uClickPos, uClickRippleTime);
      }
      
      // Shape formation during listening
      if (uFromSpeaking) {
        // When coming from speaking, transition from circle with fluid ripples to fractioned circle
        float circleWithRipples = dist + fluidRipples(pos, uEdgeRippleTime) * uFluidRippleStrength;
        baseShape = mix(circleWithRipples, fractionedDist, uCircleProgress);
      } else {
        // When coming from disconnected, transition from organic blob to fractioned circle
        baseShape = mix(blobDist, fractionedDist, uCircleProgress);
      }
    }
    else if (uAnimationState == 2) { // Speaking - perfect circle + fluid ripples
      float dist = length(pos);
      
      // Always perfect circle in speaking
      baseShape = dist;
      
      // Add fluid ripples, scaled by uFluidRippleStrength
      rippleDistortion += fluidRipples(pos, uEdgeRippleTime) * uFluidRippleStrength;
    }
    else if (uAnimationState == 3) { // Transitioning - fractioned circle back to organic blob
      float blobDist = organicBlob(pos, uTime);
      float fractionedDist = fractionedCircle(pos, uTime);
      
      // Interpolate from fractioned circle back to organic blob based on transition progress
      baseShape = mix(fractionedDist, blobDist, uTransitionProgress);
      
      // Only fade out fluid ripples if transitioning from speaking state
      if (uTransitioningFromSpeaking) {
        rippleDistortion += fluidRipples(pos, uEdgeRippleTime) * uFluidRippleStrength;
      }
    }
    
    float distortedDist = baseShape + rippleDistortion;
    
    // Main blob rendering with dynamic radius
    float blobRadius = uBlobRadius;
    float blobBlurAmount = 0.00013;
    
    float borderWidth = 0.044;
    float borderOuterRadius = blobRadius + borderWidth;
    float borderInnerRadius = blobRadius;
    
    float borderCore = 1.05 - smoothstep(borderInnerRadius, blobRadius, distortedDist);
    float borderOuter = 1.0 - smoothstep(blobRadius, borderOuterRadius, distortedDist);
    
    float noiseTexture = fbm(vUv * 2.0) * 0.3 + 0.5;
    float borderDensity = (borderOuter - borderCore) * noiseTexture * 0.8;
    
    float blob = 1.0 - smoothstep(blobRadius - blobBlurAmount, blobRadius + blobBlurAmount, distortedDist);
    
    // Shadow with relative sizing (20% larger than blob)
    float shadowOffset = 0.0;
    vec2 shadowPos = pos + vec2(shadowOffset, -shadowOffset);
    float shadowDist = baseShape + rippleDistortion;
    float shadowBlurAmount = blobRadius * 0.3; // Relative to blob size
    float shadowOuterRadius = blobRadius * 1.2; // 20% larger than blob
    
    float shadow = smoothstep(blobRadius, blobRadius + shadowBlurAmount, shadowDist) * (1.0 - smoothstep(shadowOuterRadius - shadowBlurAmount, shadowOuterRadius, shadowDist));
    float shadowSoftness = 1.0 - smoothstep(blobRadius, shadowOuterRadius, shadowDist);
    shadow *= shadowSoftness;
    
    vec3 blobColor = vec3(0.0, 0.0, 0.0);
    vec3 borderColor = vec3(1.0, 0.0, 0.478);
    vec3 shadowColor = vec3(1.0, 0.0, 0.478);
    
    vec3 finalColor = vec3(0.74, 0.74, 0.74);
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

// --- PinkGlowBlob Component (kept intact) ---
function PinkGlowBlob({ shouldRestart, onRestartComplete }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const [hasScaled, setHasScaled] = useState(false);
  const startTime = useRef(null);
  
  useEffect(() => {
    if (shouldRestart) {
      setHasScaled(false);
      startTime.current = null;
      if (meshRef.current) {
        meshRef.current.scale.setScalar(0.2);
      }
    }
  }, [shouldRestart]);
  
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
        if (!hasScaled) {
          setHasScaled(true);
          if (onRestartComplete) {
            onRestartComplete();
          }
        }
      }
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0.2, -0.41, -0.001]} >
      <planeGeometry args={[7.5, 7.5]}/>
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

// --- MODIFIED BlackBlob Component ---
function BlackBlob({ useragent, onUseragentChange, onAddCssRipple, onRippleStateChange, strokeWidth = 0.035, strokeBlur = .1, shouldRestart, onRestartComplete}) {
  const meshRef = useRef();
  const materialRef = useRef();
  const [hasScaled, setHasScaled] = useState(false);
  const [clickData, setClickData] = useState({
    hasClick: false,
    clickPos: [0.5, 0.5],
    clickTime: 0,
    fromSpeaking: false
  });
  const [circleProgress, setCircleProgress] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [fluidRippleStrength, setFluidRippleStrength] = useState(0);
  const [transitioningFromSpeaking, setTransitioningFromSpeaking] = useState(false);

  const startTime = useRef(null);
  const edgeRippleStartTime = useRef(null);
  const clickStartTime = useRef(null);
  const circleStartTime = useRef(null);
  const transitionStartTime = useRef(null);
  const rippleTimeoutRef = useRef(null);
  const { camera, gl } = useThree();
  
  // Handle restart
  useEffect(() => {
    if (shouldRestart) {
      setHasScaled(false);
      setClickData({ hasClick: false, clickPos: [0.5, 0.5], clickTime: 0, fromSpeaking: false });
      setCircleProgress(0);
      setTransitionProgress(0);
      setFluidRippleStrength(0);
      
      startTime.current = null;
      edgeRippleStartTime.current = null;
      clickStartTime.current = null;
      circleStartTime.current = null;
      transitionStartTime.current = null;
      
      if (rippleTimeoutRef.current) {
        clearTimeout(rippleTimeoutRef.current);
        rippleTimeoutRef.current = null;
      }
      
      if (meshRef.current) {
        meshRef.current.scale.setScalar(0.2);
      }
    }
  }, [shouldRestart]);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uClickPos: { value: new THREE.Vector2(0.5, 0.5) },
    uClickRippleTime: { value: 0 },
    uStrokeWidth: { value: strokeWidth },
    uStrokeBlur: { value: strokeBlur },
    uAnimationState: { value: 0 },
    uEdgeRippleTime: { value: 0 },
    uCircleProgress: { value: 0 },
    uTransitionProgress: { value: 0 },
    uHasClickRipple: { value: false },
    uFromSpeaking: { value: false },
    uTransitioningFromSpeaking: { value: false },
    uFluidRippleStrength: { value: 0.0 },
    uBlobRadius: { value: 0.35 } // Dynamic blob radius
  }), [strokeWidth, strokeBlur]);
  
  // Handle useragent prop changes and animation triggers
  useEffect(() => {
    if (useragent === 'disconnected') {
      setClickData({ hasClick: false, clickPos: [0.5, 0.5], clickTime: 0, fromSpeaking: false });
      setCircleProgress(0);
      setTransitionProgress(0);
      edgeRippleStartTime.current = null;
      clickStartTime.current = null;
      circleStartTime.current = null;
      transitionStartTime.current = null;
      setFluidRippleStrength(0);
      
      if (rippleTimeoutRef.current) {
        clearTimeout(rippleTimeoutRef.current);
        rippleTimeoutRef.current = null;
      }
      
      if (onRippleStateChange) {
        onRippleStateChange(false);
      }
    } else if (useragent === 'listening') {
      setTransitionProgress(0);
      transitionStartTime.current = null;
      
      // Longer delay when coming from speaking to show the morph nicely
      const circleDelay = clickData.fromSpeaking ? 1200 : 0; // 600ms delay when coming from speaking
      
      setTimeout(() => {
        // Start circle formation after delay
        if (circleStartTime.current === null) {
          circleStartTime.current = Date.now();
        }
      }, circleDelay);
      
      // Set appropriate fluid ripple strength based on origin
      if (clickData.fromSpeaking) {
        // Coming from speaking - start with ripples and fade them out gradually
        setFluidRippleStrength(1.0);
        // Animate fluid ripples fade-out - even slower for smoother transition
        const strengthFadeOutDuration = 1.8;
        const strengthStartTime = Date.now();
        const animateStrength = () => {
          const elapsed = (Date.now() - strengthStartTime) / 1000;
          const progress = Math.min(elapsed / strengthFadeOutDuration, 1.0);
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          setFluidRippleStrength(1.0 - easedProgress);
          if (progress < 1.0) {
            requestAnimationFrame(animateStrength);
          }
        };
        requestAnimationFrame(animateStrength);
      } else {
        // Coming from disconnected - no fluid ripples
        setFluidRippleStrength(0);
      }
    } else if (useragent === 'speaking') {
      if (edgeRippleStartTime.current === null) {
        edgeRippleStartTime.current = Date.now();
      }
      setTransitionProgress(0);
      transitionStartTime.current = null;
      setCircleProgress(1.0); // Immediately circle in speaking
      
      if (onRippleStateChange) {
        onRippleStateChange(false);
      }
      
      // Animate fluid ripples fade-in
      const strengthFadeInDuration = 0.7;
      const strengthStartTime = Date.now();
      const animateStrength = () => {
        const elapsed = (Date.now() - strengthStartTime) / 1000;
        const progress = Math.min(elapsed / strengthFadeInDuration, 1.0);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        setFluidRippleStrength(easedProgress);
        if (progress < 1.0) {
          requestAnimationFrame(animateStrength);
        }
      };
      requestAnimationFrame(animateStrength);
    } else if (useragent === 'transitioning') {
      if (transitionStartTime.current === null) {
        transitionStartTime.current = Date.now();
      }
      
      if (onRippleStateChange) {
        onRippleStateChange(false);
      }
      
      // Animate fluid ripples fade-out during transition
      const strengthFadeOutDuration = 0.7;
      const strengthStartTime = Date.now();
      const animateStrength = () => {
        const elapsed = (Date.now() - strengthStartTime) / 1000;
        const progress = Math.min(elapsed / strengthFadeOutDuration, 1.0);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        setFluidRippleStrength(1.0 - easedProgress);
        if (progress < 1.0) {
          requestAnimationFrame(animateStrength);
        }
      };
      requestAnimationFrame(animateStrength);

      // Auto-complete transition after 1.5 seconds
      const transitionTimeout = setTimeout(() => {
        if (onUseragentChange) {
          onUseragentChange('disconnected');
        }
      }, 1500);
      
      return () => clearTimeout(transitionTimeout);
    }
  }, [useragent, onUseragentChange, clickData.fromSpeaking, onRippleStateChange]);
  
  const handleClick = (event) => {
    event.stopPropagation();
    
    // Allow clicks when disconnected, speaking, OR listening
    if (useragent !== 'disconnected' && useragent !== 'speaking' && useragent !== 'listening') {
      console.log('Click disabled - useragent is', useragent);
      return;
    }
    
    const rect = gl.domElement.getBoundingClientRect();
    const screenX = (event.clientX - rect.left) / rect.width;
    const screenY = 1.0 - (event.clientY - rect.top) / rect.height;
    
    // Add CSS ripple through callback
    if (onAddCssRipple) {
      onAddCssRipple({
        id: Date.now(),
        x: event.clientX,
        y: event.clientY
      });
    }
    
    if (useragent === 'disconnected') {
      console.log('Click detected from disconnected - setting to listening with water ripple');
      
      setClickData({
        hasClick: true,
        clickPos: [screenX, screenY],
        clickTime: 0,
        fromSpeaking: false
      });
      clickStartTime.current = Date.now();
      
      // Notify parent that ripple is active
      if (onRippleStateChange) {
        onRippleStateChange(true);
      }
      
      // Set timeout to end ripple state after 1 second (water ripple duration)
      if (rippleTimeoutRef.current) {
        clearTimeout(rippleTimeoutRef.current);
      }
      
      rippleTimeoutRef.current = setTimeout(() => {
        if (onRippleStateChange) {
          onRippleStateChange(false);
        }
        rippleTimeoutRef.current = null;
      }, 1000);
      
      if (onUseragentChange) {
        onUseragentChange('listening');
      }
      
    } else if (useragent === 'speaking') {
      console.log('Click detected from speaking - setting to listening with water ripple');
      
      setClickData({
        hasClick: true,
        clickPos: [screenX, screenY],
        clickTime: 0,
        fromSpeaking: true
      });
      clickStartTime.current = Date.now();
      
      // Notify parent that ripple is active
      if (onRippleStateChange) {
        onRippleStateChange(true);
      }
      
      // Set timeout to end ripple state after 1 second
      if (rippleTimeoutRef.current) {
        clearTimeout(rippleTimeoutRef.current);
      }
      
      rippleTimeoutRef.current = setTimeout(() => {
        if (onRippleStateChange) {
          onRippleStateChange(false);
        }
        rippleTimeoutRef.current = null;
      }, 1000);
      
      if (onUseragentChange) {
        onUseragentChange('listening');
      }
      
    } else if (useragent === 'listening') {
      console.log('Click detected from listening - adding water ripple');
      
      setClickData({
        hasClick: true,
        clickPos: [screenX, screenY],
        clickTime: 0,
        fromSpeaking: false
      });
      clickStartTime.current = Date.now();
      
      // Notify parent that ripple is active
      if (onRippleStateChange) {
        onRippleStateChange(true);
      }
      
      // Set timeout to end ripple state after 1 second
      if (rippleTimeoutRef.current) {
        clearTimeout(rippleTimeoutRef.current);
      }
      
      rippleTimeoutRef.current = setTimeout(() => {
        if (onRippleStateChange) {
          onRippleStateChange(false);
        }
        rippleTimeoutRef.current = null;
      }, 1000);
    }
  };
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uStrokeWidth.value = strokeWidth;
      materialRef.current.uniforms.uStrokeBlur.value = strokeBlur;
      materialRef.current.uniforms.uFluidRippleStrength.value = fluidRippleStrength;
      
      const now = Date.now();
      
      // Handle animation states
      if (useragent === 'disconnected') {
        materialRef.current.uniforms.uAnimationState.value = 0;
        materialRef.current.uniforms.uHasClickRipple.value = false;
        materialRef.current.uniforms.uEdgeRippleTime.value = 0;
        materialRef.current.uniforms.uCircleProgress.value = 0;
        materialRef.current.uniforms.uTransitionProgress.value = 0;
        materialRef.current.uniforms.uFromSpeaking.value = false;
      }
      else if (useragent === 'listening') {
        materialRef.current.uniforms.uAnimationState.value = 1;
        materialRef.current.uniforms.uFromSpeaking.value = clickData.fromSpeaking;
        
        // Handle click ripple
        if (clickData.hasClick && clickStartTime.current) {
          const clickElapsed = (now - clickStartTime.current) / 1000;
          materialRef.current.uniforms.uHasClickRipple.value = true;
          materialRef.current.uniforms.uClickRippleTime.value = clickElapsed;
          materialRef.current.uniforms.uClickPos.value.set(clickData.clickPos[0], clickData.clickPos[1]);
        } else {
          materialRef.current.uniforms.uHasClickRipple.value = false;
        }
        
        // Handle fractioned circle formation during listening
        if (circleStartTime.current) {
          const circleElapsed = (now - circleStartTime.current) / 1000;
          // Longer duration when coming from speaking to show the nice morph
          const circleFormationDuration = clickData.fromSpeaking ? 11.5 : 0.8; 
          const progress = Math.min(circleElapsed / circleFormationDuration, 1.0);
          
          const easedProgress = progress * progress * (3.0 - 2.0 * progress);
          materialRef.current.uniforms.uCircleProgress.value = easedProgress;
          setCircleProgress(easedProgress);
        } else {
          materialRef.current.uniforms.uCircleProgress.value = 0;
        }
        
        // Edge ripple time for fluid ripples when coming from speaking
        if (edgeRippleStartTime.current) {
          const rippleElapsed = (now - edgeRippleStartTime.current) / 1000;
          materialRef.current.uniforms.uEdgeRippleTime.value = rippleElapsed;
        } else {
          materialRef.current.uniforms.uEdgeRippleTime.value = 0;
        }
        
        materialRef.current.uniforms.uTransitionProgress.value = 0;
      }
      else if (useragent === 'speaking') {
        materialRef.current.uniforms.uAnimationState.value = 2;
        materialRef.current.uniforms.uHasClickRipple.value = false;
        materialRef.current.uniforms.uFromSpeaking.value = false;
        
        materialRef.current.uniforms.uCircleProgress.value = 1.0;
        
        if (edgeRippleStartTime.current) {
          const rippleElapsed = (now - edgeRippleStartTime.current) / 1000;
          materialRef.current.uniforms.uEdgeRippleTime.value = rippleElapsed;
        }
        
        materialRef.current.uniforms.uTransitionProgress.value = 0;
      }
      else if (useragent === 'transitioning') {
        materialRef.current.uniforms.uAnimationState.value = 3;
        materialRef.current.uniforms.uHasClickRipple.value = false;
        materialRef.current.uniforms.uFromSpeaking.value = false;
        
        if (transitionStartTime.current) {
          const transitionElapsed = (now - transitionStartTime.current) / 1000;
          const transitionDuration = 1.5;
          const progress = Math.min(transitionElapsed / transitionDuration, 1.0);
          
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          materialRef.current.uniforms.uTransitionProgress.value = easedProgress;
          setTransitionProgress(easedProgress);
        }
        
        materialRef.current.uniforms.uCircleProgress.value = 1.0;
        
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
        if (!hasScaled) {
          setHasScaled(true);
          if (onRestartComplete) {
            onRestartComplete();
          }
        }
      }
    }
  });
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (rippleTimeoutRef.current) {
        clearTimeout(rippleTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <mesh ref={meshRef} onClick={handleClick} >
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

// --- Scene Component with Manual Speaking Button ---
function Scene({ strokeWidth = 0.025, strokeBlur = 1.5 }) {
  const [useragent, setUseragent] = useState('disconnected');
  const [cssRipples, setCssRipples] = useState([]);
  const [shouldRestart, setShouldRestart] = useState(false);
  const [restartCompletionCount, setRestartCompletionCount] = useState(0);
  const [isRippleActive, setIsRippleActive] = useState(false);
  
  const handleUseragentChange = (newState) => {
    console.log('Useragent changed to:', newState);
    setUseragent(newState);
  };

  const handleAddCssRipple = (ripple) => {
    setCssRipples(prev => [...prev, ripple]);
    
    // Remove CSS ripple after animation
    setTimeout(() => {
      setCssRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 600);
  };

  const handleRippleStateChange = (isActive) => {
    setIsRippleActive(isActive);
  };

  const handleSpeakClick = () => {
    console.log('Speak button clicked');
    handleUseragentChange('speaking');
  };

  const handleStopClick = () => {
    if (useragent === 'speaking') {
      handleUseragentChange('transitioning');
    } else if (useragent === 'listening') {
      handleUseragentChange('transitioning');
    } else {
      handleUseragentChange('disconnected');
    }
  };

  const handleRefreshClick = () => {
    console.log('Refresh clicked - no action');
  };

  const handleRestartConversation = () => {
    console.log('Restart conversation - full reset with scaling animation');
    setUseragent('disconnected');
    setRestartCompletionCount(0);
    setShouldRestart(true);
    setIsRippleActive(false);
  };

  const handleRestartComplete = () => {
    const newCount = restartCompletionCount + 1;
    setRestartCompletionCount(newCount);
    
    if (newCount >= 2) {
      setShouldRestart(false);
      setRestartCompletionCount(0);
      console.log('Restart animation complete');
    }
  };

  // Determine what status text to show
  const getStatusText = () => {
    if (useragent === 'listening' && isRippleActive) {
      return 'Processing...';
    }
    return useragent.charAt(0).toUpperCase() + useragent.slice(1);
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
          font-weight: bold;
          font-family: system-ui, -apple-system, sans-serif;
          gap: 6px;
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
          gap: 10px;
          align-items: center;
          margin: 12px 0;
          scale: 1.35;
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
          border-radius: 50%;
        }
        
        .action-button:hover {
          transform: scale(1.1);
        }
        
        .speak-button {
          background: #ff007a;
          color: white;
          font-size: 12px;
          font-weight: bold;
          padding: 8px 16px;
          border-radius: 24px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .speak-button:hover {
          background: #e60069;
          transform: scale(1.05);
        }
        
        .speak-button:disabled {
          background: #ccc;
          cursor: not-allowed;
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
        
        .status-indicator {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }
      `}</style>
      
      {/* CSS Ripples */}
      {cssRipples.map(ripple => (
        <div
          key={ripple.id}
          className="css-ripple"
          style={{
            position: 'fixed',
            left: ripple.x,
            top: ripple.y,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'rgba(255, 0, 123, 0)',
            border: '2px solid rgba(255, 255, 255, 0.6)',
            pointerEvents: 'none',
            zIndex: 9999
          }}
        />
      ))}
      
      {/* Main Canvas */}
      <Canvas 
        style={{ 
          height: '100vh', 
          width: '100%', 
          background: '#f0f0f0',
          cursor: (useragent === 'disconnected' || useragent === 'speaking' || useragent === 'listening') ? 'pointer' : 'default'
        }}
        camera={{ position: [0, 0, 10], fov: 75 }}
        gl={{ antialias: true }}
        
      >
        <PinkGlowBlob 
          shouldRestart={shouldRestart} 
          onRestartComplete={handleRestartComplete} 
        />
        <BlackBlob 
          useragent={useragent}
          onUseragentChange={handleUseragentChange}
          onAddCssRipple={handleAddCssRipple}
          onRippleStateChange={handleRippleStateChange}
          strokeWidth={strokeWidth} 
          strokeBlur={strokeBlur}
          shouldRestart={shouldRestart}
          onRestartComplete={handleRestartComplete}
        />
      </Canvas>
      
      {/* UI Container Below Blob */}
      <div className="ui-container">
        <div className="status-indicator">
          Status: {getStatusText()}
        </div>
        
        <div className="main-text">
          Tap and talk to begin
        </div>
        
        <div className="sub-text">
          Unable to talk and/or listen? <span className="text-to-talk">Text to talk</span>.
        </div>
        
        <div className="action-buttons">
          <button 
            className="speak-button" 
            onClick={handleSpeakClick}
            disabled={useragent === 'speaking' || useragent === 'transitioning'}
          >
            SPEAK
          </button>
          
          <button className="action-button" onClick={handleStopClick} title="Stop">
            <div style={{width: '16px', height: '16px', background: '#ff007a', borderRadius: '2px'}}></div>
          </button>
          
          <button className="action-button" onClick={handleRefreshClick} title="Refresh">
            <div style={{
              width: '20px', 
              height: '20px', 
              border: '2px solid #ff007a', 
              borderTop: 'transparent',
              borderRadius: '50%'
            }}></div>
          </button>
        </div>
        
        <div className="restart-link" onClick={handleRestartConversation}>
          Restart Conversation
        </div>
      </div>
    </div>
  );
}

export default Scene;