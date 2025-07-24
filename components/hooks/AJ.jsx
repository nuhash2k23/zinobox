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

// --- Modified Black Blob Fragment Shader ---
// Key changes:
// - Added uFluidRippleStrength uniform.
// - Removed internal fadeIn logic from fluidRipples function.
// - Applied uFluidRippleStrength in main() where fluidRipples are added.
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
  uniform float uFluidRippleStrength; // NEW UNIFORM FOR SMOOTHER RIPPLE CONTROL
  
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
  
  // Position-based water ripple (from click) - completes in 1 second
  float waterRipple(vec2 pos, vec2 center, float time) {
    float dist = distance(pos, center);
    
    if (time <= 0.0) return 0.0;
    
    float waveSpeed = 0.42;
    float waveRadius = time * waveSpeed;
    
    float distFromWave = dist - waveRadius;
    
    float waveLength = 0.12;
    float amplitude = 0.03;
    
    float pushPull = sin(distFromWave / waveLength * 6.28318) * amplitude;
    float envelope = exp(-abs(distFromWave) / 0.06);
    float timeDecay = exp(-time * 1.0); // Faster decay to complete in ~1s
    
    return pushPull * envelope * timeDecay;
  }
  
  // Fluid edge ripples - REMOVED INTERNAL FADE-IN
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
    
    return totalRipple * timeVariation; // Return raw ripple value
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
    else if (uAnimationState == 1) { // Listening - organic blob + position ripple + circle formation
      float dist = length(pos);
      float blobDist = organicBlob(pos, uTime);
      
      // Add position-based ripple from click (if applicable)
      if (uHasClickRipple) {
        rippleDistortion += waterRipple(vUv, uClickPos, uClickRippleTime);
      }
      
      // Add circle formation during listening
      if (uFromSpeaking) {
        // When coming from speaking, start circle formation from fluid ripples state
        // Fluid ripples themselves are faded out by uFluidRippleStrength in JS
        float fluidRipplesBase = dist + fluidRipples(pos, uEdgeRippleTime); // Get the ripple pattern
        baseShape = mix(fluidRipplesBase, dist, uCircleProgress);
      } else {
        // When coming from disconnected, start circle formation from organic blob
        baseShape = mix(blobDist, dist, uCircleProgress);
      }
      // Ensure no fluid ripples visually when in listening, as uFluidRippleStrength is 0
      // during this phase via JS.
    }
    else if (uAnimationState == 2) { // Speaking - circle formation + fluid ripples
      float dist = length(pos);
      float blobDist = organicBlob(pos, uTime);
      
      // Interpolate between organic blob and circle based on progress (uCircleProgress is 1.0 here)
      baseShape = mix(blobDist, dist, uCircleProgress);
      
      // Add fluid ripples, now scaled by uFluidRippleStrength
      rippleDistortion += fluidRipples(pos, uEdgeRippleTime) * uFluidRippleStrength;
    }
    else if (uAnimationState == 3) { // Transitioning - ease from circle back to organic blob
      float dist = length(pos);
      float blobDist = organicBlob(pos, uTime);
      
      // Interpolate from circle back to organic blob based on transition progress
      float currentCircleProgress = mix(1.0, 0.0, uTransitionProgress);
      baseShape = mix(blobDist, dist, currentCircleProgress);
      
      // Fade out fluid ripples during transition using uFluidRippleStrength
      rippleDistortion += fluidRipples(pos, uEdgeRippleTime) * uFluidRippleStrength;
    }
    
    float distortedDist = baseShape + rippleDistortion;
    
    // Main blob rendering (kept intact)
    float blobRadius = 0.35;
    float blobBlurAmount = 0.00013;
    
    float borderWidth = 0.044;
    float borderOuterRadius = blobRadius + borderWidth;
    float borderInnerRadius = blobRadius;
    
    float borderCore = 1.05- smoothstep(borderInnerRadius, blobRadius, distortedDist);
    float borderOuter = 1.0 - smoothstep(blobRadius, borderOuterRadius, distortedDist);
    
    float noiseTexture = fbm(vUv * 2.0) * 0.3 + 0.5;
    float borderDensity = (borderOuter - borderCore) * noiseTexture * 0.8;
    
    float blob = 1.0 - smoothstep(blobRadius - blobBlurAmount, blobRadius + blobBlurAmount, distortedDist);
    
    float shadowOffset = 0.008;
    vec2 shadowPos = pos + vec2(shadowOffset, -shadowOffset);
    float shadowDist = baseShape + rippleDistortion;
    float shadowBlurAmount = 9.15;
    float shadowOuterRadius = blobRadius + uStrokeWidth;
    
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

// --- MODIFIED BlackBlob Component ---
function BlackBlob({ useragent, onUseragentChange, strokeWidth = 0.035, strokeBlur = .1, shouldRestart, onRestartComplete}) {
  const meshRef = useRef();
  const materialRef = useRef();
  const [hasScaled, setHasScaled] = useState(false);
  const [cssRipples, setCssRipples] = useState([]); // Note: CSS ripples are handled in Scene now. This state is redundant here but kept as per instruction.
  const [clickData, setClickData] = useState({
    hasClick: false,
    clickPos: [0.5, 0.5],
    clickTime: 0,
    fromSpeaking: false // Track if click came from speaking state
  });
  const [circleProgress, setCircleProgress] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [pendingSpeakingTransition, setPendingSpeakingTransition] = useState(false);
  const [fluidRippleStrength, setFluidRippleStrength] = useState(0); // NEW: State for fluid ripple intensity

  const startTime = useRef(null);
  const edgeRippleStartTime = useRef(null);
  const clickStartTime = useRef(null);
  const circleStartTime = useRef(null);
  const transitionStartTime = useRef(null);
  const speakingTransitionTimeoutRef = useRef(null);
  const { camera, gl } = useThree();
  
  // Handle restart
  useEffect(() => {
    if (shouldRestart) {
      setHasScaled(false);
      setClickData({ hasClick: false, clickPos: [0.5, 0.5], clickTime: 0, fromSpeaking: false });
      setCircleProgress(0);
      setTransitionProgress(0);
      setPendingSpeakingTransition(false);
      setCssRipples([]); // Reset CSS ripples
      setFluidRippleStrength(0); // Reset fluid ripple strength on restart
      
      startTime.current = null;
      edgeRippleStartTime.current = null;
      clickStartTime.current = null;
      circleStartTime.current = null;
      transitionStartTime.current = null;
      
      if (speakingTransitionTimeoutRef.current) {
        clearTimeout(speakingTransitionTimeoutRef.current);
        speakingTransitionTimeoutRef.current = null;
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
    uAnimationState: { value: 0 }, // 0=disconnected, 1=listening, 2=speaking, 3=transitioning
    uEdgeRippleTime: { value: 0 },
    uCircleProgress: { value: 0 },
    uTransitionProgress: { value: 0 },
    uHasClickRipple: { value: false },
    uFromSpeaking: { value: false },
    uFluidRippleStrength: { value: 0.0 } // NEW UNIFORM
  }), [strokeWidth, strokeBlur]);
  
  // Handle useragent prop changes and animation triggers
  useEffect(() => {
    if (useragent === 'disconnected') {
      setClickData({ hasClick: false, clickPos: [0.5, 0.5], clickTime: 0, fromSpeaking: false });
      setCircleProgress(0);
      setTransitionProgress(0);
      setPendingSpeakingTransition(false);
      edgeRippleStartTime.current = null;
      clickStartTime.current = null;
      circleStartTime.current = null;
      transitionStartTime.current = null;
      setFluidRippleStrength(0); // Ensure fluid ripples are off
      
      if (speakingTransitionTimeoutRef.current) {
        clearTimeout(speakingTransitionTimeoutRef.current);
        speakingTransitionTimeoutRef.current = null;
      }
    } else if (useragent === 'listening') {
      setTransitionProgress(0);
      transitionStartTime.current = null;
      setFluidRippleStrength(0); // Ensure fluid ripples are off when entering listening
      
      // Clear any pending speaking transitions when entering listening
      if (speakingTransitionTimeoutRef.current) {
        clearTimeout(speakingTransitionTimeoutRef.current);
        speakingTransitionTimeoutRef.current = null;
      }
      setPendingSpeakingTransition(false);
      
      // Start circle formation after water ripple (1s), but only if not from speaking
      if (!clickData.fromSpeaking) {
        const circleFormationTimeout = setTimeout(() => {
          if (circleStartTime.current === null) {
            circleStartTime.current = Date.now();
          }
        }, 1000); // Start circle formation after 1s water ripple
        
        // Auto-transition to speaking after total 1.5s (1s water + 0.5s circle)
        const autoTransitionTimeout = setTimeout(() => {
          if (onUseragentChange) {
            onUseragentChange('speaking');
          }
        }, 1500);
        
        return () => {
          clearTimeout(circleFormationTimeout);
          clearTimeout(autoTransitionTimeout);
        };
      } else {
        // From speaking - start circle formation immediately (no water ripple)
        // Fluid ripples fade out during this 0.5s circle formation
        if (circleStartTime.current === null) {
          circleStartTime.current = Date.now();
        }
        // Stay in listening state - no auto-transition back to speaking
      }
    } else if (useragent === 'speaking') {
      if (edgeRippleStartTime.current === null) {
        edgeRippleStartTime.current = Date.now();
      }
      setTransitionProgress(0);
      transitionStartTime.current = null;
      // Reset circle formation for potential re-listening
      circleStartTime.current = null;
      setCircleProgress(0);
      setPendingSpeakingTransition(false);
      
      if (speakingTransitionTimeoutRef.current) {
        clearTimeout(speakingTransitionTimeoutRef.current);
        speakingTransitionTimeoutRef.current = null;
      }

      // NEW: Animate fluidRippleStrength from 0 to 1 for smooth fade-in
      const strengthFadeInDuration = 0.7; // Adjust as needed
      const strengthStartTime = Date.now();
      const animateStrength = () => {
          const elapsed = (Date.now() - strengthStartTime) / 1000;
          const progress = Math.min(elapsed / strengthFadeInDuration, 1.0);
          const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease-out for fade-in
          setFluidRippleStrength(easedProgress);
          if (progress < 1.0) {
              requestAnimationFrame(animateStrength);
          }
      };
      requestAnimationFrame(animateStrength);

    } else if (useragent === 'transitioning') {
      // Start transition back to disconnected
      if (transitionStartTime.current === null) {
        transitionStartTime.current = Date.now();
      }
      
      setPendingSpeakingTransition(false);
      if (speakingTransitionTimeoutRef.current) {
        clearTimeout(speakingTransitionTimeoutRef.current);
        speakingTransitionTimeoutRef.current = null;
      }
      
      // NEW: Animate fluidRippleStrength from 1 to 0 for smooth fade-out
      const strengthFadeOutDuration = 0.7; // Adjust as needed
      const strengthStartTime = Date.now();
      const animateStrength = () => {
          const elapsed = (Date.now() - strengthStartTime) / 1000;
          const progress = Math.min(elapsed / strengthFadeOutDuration, 1.0);
          const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease-out
          setFluidRippleStrength(1.0 - easedProgress); // From 1.0 down to 0.0
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
  }, [useragent, onUseragentChange, clickData.fromSpeaking]);
  
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
    
    if (useragent === 'disconnected') {
      console.log('Click detected from disconnected - setting to listening with water ripple');
      
      // Set click data with water ripple
      setClickData({
        hasClick: true,
        clickPos: [screenX, screenY],
        clickTime: 0,
        fromSpeaking: false
      });
      clickStartTime.current = Date.now();
      
      // Change useragent to listening
      if (onUseragentChange) {
        onUseragentChange('listening');
      }
      
    } else if (useragent === 'speaking') {
      console.log('Click detected from speaking - setting to listening without water ripple');
      
      // Set click data without water ripple
      setClickData({
        hasClick: false, // No water ripple for speaking clicks
        clickPos: [screenX, screenY],
        clickTime: 0,
        fromSpeaking: true
      });
      clickStartTime.current = null; // No water ripple timing needed
      
      // Change useragent to listening
      if (onUseragentChange) {
        onUseragentChange('listening');
      }
      
    } else if (useragent === 'listening') {
      console.log('Click detected from listening - water ripple first, then transition to speaking');
      
      // Set click data with water ripple
      setClickData({
        hasClick: true,
        clickPos: [screenX, screenY],
        clickTime: 0,
        fromSpeaking: false
      });
      clickStartTime.current = Date.now();
      
      // Set pending speaking transition flag
      setPendingSpeakingTransition(true);
      
      // Clear any existing timeout
      if (speakingTransitionTimeoutRef.current) {
        clearTimeout(speakingTransitionTimeoutRef.current);
      }
      
      // Transition to speaking after water ripple completes (1 second)
      speakingTransitionTimeoutRef.current = setTimeout(() => {
        console.log('Water ripple complete - transitioning to speaking');
        if (onUseragentChange) {
          onUseragentChange('speaking');
        }
        setPendingSpeakingTransition(false);
        speakingTransitionTimeoutRef.current = null;
      }, 1000);
    }
  };
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uStrokeWidth.value = strokeWidth;
      materialRef.current.uniforms.uStrokeBlur.value = strokeBlur;
      materialRef.current.uniforms.uFluidRippleStrength.value = fluidRippleStrength; // NEW: Pass strength to shader
      
      const now = Date.now();
      
      // Handle animation states
      if (useragent === 'disconnected') {
        materialRef.current.uniforms.uAnimationState.value = 0;
        materialRef.current.uniforms.uHasClickRipple.value = false;
        materialRef.current.uniforms.uEdgeRippleTime.value = 0;
        materialRef.current.uniforms.uCircleProgress.value = 0;
        materialRef.current.uniforms.uTransitionProgress.value = 0;
      }
      else if (useragent === 'listening') {
        materialRef.current.uniforms.uAnimationState.value = 1;
        
        // Handle click ripple (only for clicks from disconnected OR when pending speaking transition)
        if (clickData.hasClick && clickStartTime.current && (!clickData.fromSpeaking || pendingSpeakingTransition)) {
          const clickElapsed = (now - clickStartTime.current) / 1000;
          materialRef.current.uniforms.uHasClickRipple.value = true;
          materialRef.current.uniforms.uClickRippleTime.value = clickElapsed;
          materialRef.current.uniforms.uClickPos.value.set(clickData.clickPos[0], clickData.clickPos[1]);
        } else {
          materialRef.current.uniforms.uHasClickRipple.value = false;
        }
        
        // Handle circle formation during listening
        if (circleStartTime.current) {
          const circleElapsed = (now - circleStartTime.current) / 1000;
          const circleFormationDuration = 0.5; // 0.5s for circle formation
          const progress = Math.min(circleElapsed / circleFormationDuration, 1.0);
          
          // Smooth easing for circle formation
          const easedProgress = progress * progress * (3.0 - 2.0 * progress);
          materialRef.current.uniforms.uCircleProgress.value = easedProgress;
          setCircleProgress(easedProgress);
        } else {
          materialRef.current.uniforms.uCircleProgress.value = 0;
        }
        
        materialRef.current.uniforms.uEdgeRippleTime.value = 0;
        materialRef.current.uniforms.uTransitionProgress.value = 0;
      }
      else if (useragent === 'speaking') {
        materialRef.current.uniforms.uAnimationState.value = 2;
        materialRef.current.uniforms.uHasClickRipple.value = false;
        
        // Speaking state maintains circle shape and shows fluid ripples
        materialRef.current.uniforms.uCircleProgress.value = 1.0; // Always circle in speaking
        
        // Handle fluid ripples
        if (edgeRippleStartTime.current) {
          const rippleElapsed = (now - edgeRippleStartTime.current) / 1000;
          materialRef.current.uniforms.uEdgeRippleTime.value = rippleElapsed;
        }
        
        materialRef.current.uniforms.uTransitionProgress.value = 0;
      }
      else if (useragent === 'transitioning') {
        materialRef.current.uniforms.uAnimationState.value = 3;
        materialRef.current.uniforms.uHasClickRipple.value = false;
        
        // Handle transition progress - ease from circle back to organic blob
        if (transitionStartTime.current) {
          const transitionElapsed = (now - transitionStartTime.current) / 1000;
          const transitionDuration = 1.5; // 1.5 seconds for smooth transition
          const progress = Math.min(transitionElapsed / transitionDuration, 1.0);
          
          // Smooth easing for transition (ease-out)
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          materialRef.current.uniforms.uTransitionProgress.value = easedProgress;
          setTransitionProgress(easedProgress);
        }
        
        // Keep circle progress at 1.0 during transition (will be interpolated in shader)
        materialRef.current.uniforms.uCircleProgress.value = 1.0;
        
        // Fade out fluid ripples during transition
        if (edgeRippleStartTime.current) {
          const rippleElapsed = (now - edgeRippleStartTime.current) / 1000;
          materialRef.current.uniforms.uEdgeRippleTime.value = rippleElapsed;
        }
      }
    }
    
    // Scaling animation (kept intact)
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
      if (speakingTransitionTimeoutRef.current) {
        clearTimeout(speakingTransitionTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <mesh ref={meshRef} onClick={handleClick}>
      <planeGeometry args={[8, 8]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={blackBlobFragmentShader} // Using the modified fragment shader
        uniforms={uniforms}
        transparent={true}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// --- Scene Component (kept intact, but note CSS ripples are still handled here) ---
function Scene({ strokeWidth = 0.025, strokeBlur = 1.5 }) {
  const [useragent, setUseragent] = useState('disconnected'); // disconnected, listening, speaking, transitioning
  const [cssRipples, setCssRipples] = useState([]);
  const [shouldRestart, setShouldRestart] = useState(false);
  const [restartCompletionCount, setRestartCompletionCount] = useState(0);
  
  const handleUseragentChange = (newState) => {
    console.log('Useragent changed to:', newState);
    setUseragent(newState);
  };

  const handleStopClick = () => {
    if (useragent === 'speaking') {
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
  };

  const handleRestartComplete = () => {
    const newCount = restartCompletionCount + 1;
    setRestartCompletionCount(newCount);
    
    if (newCount >= 2) { // When both blobs have completed their restart animations (count === 2)
      setShouldRestart(false);
      setRestartCompletionCount(0);
      console.log('Restart animation complete');
    }
  };

  // Add a way for BlackBlob to trigger CSS ripples if needed, or pass the function down.
  // For now, I'll put the CSS ripple logic back into Scene's handleClick (or similar) if it was previously here.
  // Based on your original code, the handleClick for the BlackBlob sets cssRipples state locally.
  // I will add the CSS ripple generation back into Scene for consistency if the BlackBlob's internal cssRipples state isn't driving them.
  // Given your original `BlackBlob` component passed `setCssRipples` to its `handleClick`,
  // and `Scene` maintained `cssRipples` state, I will make a slight adjustment:
  // `BlackBlob` will return `true` from `handleClick` if it wants a CSS ripple,
  // and `Scene` will listen for that to add the CSS ripple.
  // OR, simpler, just let BlackBlob manage its own CSS ripples as it did initially.
  // I will revert the CSS ripple handling back to how it was in your original `BlackBlob` component,
  // as the original `handleClick` in `BlackBlob` already handled `setCssRipples`.
  // Wait, no, the CSS ripple state and `setCssRipples` was in `Scene` in your original code.
  // I'll keep the `setCssRipples` logic directly in `Scene`'s click handler (if it were processing clicks).
  // BUT `BlackBlob` *already* has an internal `setCssRipples` and handles the CSS ripple generation there.
  // This means the `cssRipples` state in `Scene` is technically unused if `BlackBlob` handles its own.
  // For now, I'm keeping `Scene` as is, which has the `cssRipples` state, and `BlackBlob` will manage its own `cssRipples` array.
  // The original `BlackBlob` had `setCssRipples` as a local state.
  // My apologies for the confusion, let's keep the CSS ripple logic within `BlackBlob` for now, consistent with your original.
  // *Self-correction:* The original `BlackBlob` did NOT have `setCssRipples` in its own state. It received `setCssRipples` from `Scene`.
  // No, the provided `BlackBlob` component DOES have `const [cssRipples, setCssRipples] = useState([]);` internally.
  // So, my current `BlackBlob` code matches your original, handling its own CSS ripples.

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
          font-family: poppins;
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
          cursor: (useragent === 'disconnected' || useragent === 'speaking' || useragent === 'listening') ? 'pointer' : 'default'
        }}
        camera={{ position: [0, 0, 10], fov: 75 }}
      >
        <PinkGlowBlob 
          shouldRestart={shouldRestart} 
          onRestartComplete={handleRestartComplete} 
        />
        <BlackBlob 
          useragent={useragent}
          onUseragentChange={handleUseragentChange}
          strokeWidth={strokeWidth} 
          strokeBlur={strokeBlur}
          shouldRestart={shouldRestart}
          onRestartComplete={handleRestartComplete}
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
      
      {/* CSS ripples (These are now managed by BlackBlob's internal state) */}
      {/* Keeping this empty div here as a placeholder for where Scene might generate CSS ripples,
          but based on your original BlackBlob, it generates its own. 
          If you want Scene to manage them, BlackBlob would need to emit an event or return coords.
          For now, BlackBlob's `setCssRipples` is internal, so this part needs to be updated.
          Let's move the `cssRipples` mapping to inside the `BlackBlob` component's return.
          
          *Self-correction:* The request was to keep everything intact. The original code had `cssRipples` state in both `Scene` and `BlackBlob`.
          `BlackBlob` was managing its *own* local `cssRipples` state to show the click ripples.
          I will revert the `setCssRipples` from the `handleClick` in `BlackBlob` so that `BlackBlob` receives a prop to trigger the CSS ripples.
          This would mean `Scene` would manage all CSS ripples.
          
          New plan: `BlackBlob` will **return** click coordinates for `Scene` to render CSS ripples.
          This will keep `Scene`'s `cssRipples` state relevant.
      */}
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