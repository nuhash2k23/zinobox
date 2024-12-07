
import React, { useEffect, useRef } from 'react'
import { useGLTF, PerspectiveCamera, useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'


const createPulsingShaderMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#ff0000') }, // More intense red
      uPulseIntensity: { value: 0.0 },
      baseTexture: { value: null }
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
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uPulseIntensity;
      uniform sampler2D baseTexture;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vec4 baseColor = texture2D(baseTexture, vUv);
        float pulse = (sin(uTime * 2.0) * .25 + 0.25) * uPulseIntensity;
        vec3 glowColor = mix(baseColor.rgb, uColor, pulse);
        float glow = pulse * 1.5; // Increased glow intensity
        vec3 finalColor = mix(baseColor.rgb, glowColor, glow);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    transparent: true
  });
}

export function Scene(props) {
  const { nodes, materials } = useGLTF('/stage.glb')
  const scroll = useScroll()
  const cameraRef = useRef()
  const lidRef = useRef()
  const clipRef = useRef()
  const pressRef = useRef()
  const tearGroupRef = useRef()
  const cardGroupRef = useRef()
  const pulsingMaterial = useRef()
  const originalMaterials = useRef({})

  // Camera keyframes
  const cameraKeyframes = [
    // {
    //   fov:50.89,
    //   position:[-2.981, 2.984, -3.555],
    //   rotation:[-2.573, -0.505, -2.727]
    // },
    {
        fov:75.89,
        position:[2.179, 1.46, -1.188],
        rotation:[-2.528, 0.709, 2.711]
      },
    

      {
        fov:90.89,
        position:[-2.501, 1.265, -1.004],
        rotation:[-2.148, -0.64, -2.399]
      },
      
      {
        fov:90.89,
        position:[-2.501, 1.265, -1.004],
        rotation:[-2.148, -0.64, -2.399]
      },



    {
      fov: 95.743,
      position: [-0.211, 0.073, -0.316],
      rotation: [-2.882, -0.715, -2.969],
    },


    {
      fov: 80.52,
      position: [0.375, 0.4, -0.496],
      rotation: [-2.491, 0.521, 2.642],
    },
    {
      fov: 90.52,
      position: [0.375, 0.4, -0.496],
      rotation: [-2.491, 0.521, 2.642],
    },
    {
      fov: 70.52,
      position: [0.375, 0.4, -0.496],
      rotation: [-2.491, 0.521, 2.642],
    },

    {
      fov: 65.461,
      position: [-0.572, 0.444, 1.734],
      rotation: [-2.698, -0.553, 3.086],
    },
       {
      fov: 55.461,
      position: [-0.572, 0.444, 1.734],
      rotation: [-2.698, -0.553, 3.086],
    },
       {
      fov: 45.461,
      position: [0.574, 0.552, 2.032],
      rotation: [-2.314, 0.723, 2.681],
    },
    {
      fov: 25.461,
      position: [0.574, 0.552, 2.032],
      rotation: [-2.314, 0.723, 2.681],
    },
    {
      fov: 25.461,
      position: [0.574, 0.552, 2.032],
      rotation: [-2.314, 0.723, 2.681],
    },
    // {
    //   fov: 86.461,
    //   position: [-0.117, 0.117, 2.298],
    //   rotation: [-2.698, -0.553, 3.086],
    // },
    // {
    //   fov: 106.461,
    //   position: [-0.117, 0.117, 2.298],
    //   rotation: [-2.698, -0.553, 3.086],
    // },
    {
      fov: 26.461,
      position: [1.446, 1.814, 1.298],
      rotation: [-2.16, 0.672, 2.52],
    },
    {
      fov: 26.461,
      position: [1.446, 1.814, 1.298],
      rotation: [-2.16, 0.672, 2.52],
    },
    {
      fov:90.89,
      position:[-2.501, 1.265, -1.004],
      rotation:[-2.148, -0.64, -2.399]
    },
    {
      fov:75.89,
      position:[2.179, 1.46, -1.188],
      rotation:[-2.528, 0.709, 2.711]
    },
  


    // {
    //   fov: 33.461,
    //   position:[-3.892, 1.218, -3.592],
    //   rotation:[-2.897, -0.686, -2.861],
    // },
    // {
    //   fov: 36.461,
    //   position:[-3.892, 1.218, -3.592],
    //   rotation:[-2.897, -0.686, -2.861],
    // },
    // {
    //   fov: 80.461,
    //   position:[-3.892, 1.218, -3.592],
    //   rotation:[-2.897, -0.686, -2.861],
    // },

  ]

  // Easing functions
  const easing = {
    easeIn: (t) => t * t,
    easeOut: (t) => 1 - Math.pow(1 - t, 2),
    easeInOut: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    bounce: (t) => {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }

  // Animation keyframes for lid and clip
  const meshAnimations = {
    lid: [
      { rotation: [0, -0.002, 0], keyframe: 0 },
      { rotation: [0, -0.002, 0], keyframe: 2.2 },
      { rotation: [0, -0.002, 0], keyframe: 5.3 },
      { rotation: [1.344, -0.002, 0], keyframe: 6.6 },
      
    ],
    clip: [
      { rotation: [0, -0.002, 0], keyframe: 0 },
      { rotation: [0, -0.002, 0], keyframe: 3 },
      { rotation: [0, -0.002, 0], keyframe: 4 },

      { rotation: [-1.37, -0.002, 0], keyframe:6.21},
      { rotation: [0, -0.002, 0], keyframe:8.1},
     
 
    ],
    press: [
      { position: [-0.013, 0.045, 2.743], keyframe: 0 },
      { position: [-0.013, 0.045, 2.743], keyframe: 9.1 },
      { position: [-0.013, 0.042, 2.743], keyframe:9.11 },
      { position: [-0.013, 0.042, 2.743], keyframe:9.81 },
      { position: [-0.013, 0.042, 2.743], keyframe:12.81 },
      { position: [-0.013, 0.045, 2.743], keyframe:12.91 },
     

    ],
    tearGroup: [
      { rotation: [0, 0, 0], keyframe: 0 },
      { rotation: [0, 0, 0], keyframe: 9 },
      { rotation: [1.472, 0, 0], keyframe: 12.95 },
      { rotation: [0, 0, 0], keyframe: 13.12 },
    ],
    cardGroup: [
      { position:[-0.005, 0.042, 2.549], keyframe: 0 },
      { position: [-0.005, 0.042, 2.549], keyframe: 11 },
      { position: [-0.005, 0.28, 2.549], keyframe: 12 }, // Adjust these coordinates as needed
      { position: [-0.005, 0.042, 2.549], keyframe: 13 },
    ],
  }
  const getInterpolatedPosition = (animations, currentKeyframe, easeFunc = easing.easeOut) => {
    let currentAnim = animations[0]
    let nextAnim = animations[1]
    
    for (let i = 0; i < animations.length - 1; i++) {
      if (currentKeyframe >= animations[i].keyframe && currentKeyframe <= animations[i + 1].keyframe) {
        currentAnim = animations[i]
        nextAnim = animations[i + 1]
        break
      }
    }
  
    const progress = (currentKeyframe - currentAnim.keyframe) / 
                    (nextAnim.keyframe - currentAnim.keyframe)
    
    const easedProgress = easeFunc(Math.min(Math.max(progress, 0), 1))
  
    return currentAnim.position.map((start, index) => 
      THREE.MathUtils.lerp(start, nextAnim.position[index], easedProgress)
    )
  }
  const getInterpolatedRotation = (animations, currentKeyframe, easeFunc = easing.easeOut) => {
    let currentAnim = animations[0]
    let nextAnim = animations[1]
    
    for (let i = 0; i < animations.length - 1; i++) {
      if (currentKeyframe >= animations[i].keyframe && currentKeyframe <= animations[i + 1].keyframe) {
        currentAnim = animations[i]
        nextAnim = animations[i + 1]
        break
      }
    }

    const progress = (currentKeyframe - currentAnim.keyframe) / 
                    (nextAnim.keyframe - currentAnim.keyframe)
    
    const easedProgress = easeFunc(Math.min(Math.max(progress, 0), 1))

    return currentAnim.rotation.map((start, index) => 
      THREE.MathUtils.lerp(start, nextAnim.rotation[index], easedProgress)
    )
  }
  useEffect(() => {
    // Create pulsing shader material
    const shader = createPulsingShaderMaterial();
    if (materials['Surprise ']) {
      shader.uniforms.baseTexture.value = materials['Surprise '].map;
    }
    pulsingMaterial.current = shader;

    // Store original material for press mesh
    if (materials['Surprise ']) {
      originalMaterials.current['press'] = materials['Surprise '].clone();
    }

    return () => {
      shader.dispose();
      Object.values(originalMaterials.current).forEach(material => material.dispose());
    };
  }, [materials]);

  useFrame((state, delta) => {
    if (!cameraRef.current || !lidRef.current || !clipRef.current || 
        !pressRef.current || !tearGroupRef.current || !cardGroupRef.current) return

    const scrollProgress = scroll.offset
    const numberOfKeyframes = cameraKeyframes.length - 1
    const currentKeyframe = scrollProgress * numberOfKeyframes

    // Camera animation
    const keyframeIndex = Math.min(
      Math.floor(scrollProgress * numberOfKeyframes),
      numberOfKeyframes - 1
    )
    
    // First fade sequence
    const fadeStartKeyframe = 1;
    const fadeEndKeyframe = 2.6;
    const fadeInStartKeyframe = fadeEndKeyframe + 0.1;
    const fadeInEndKeyframe = fadeInStartKeyframe + 1.0;
    
    // Second fade sequence
    const fadeStartKeyframe2 = 6.9;
    const fadeEndKeyframe2 = 7.28;
    const fadeInStartKeyframe2 = fadeEndKeyframe2 + 0.1;
    const fadeInEndKeyframe2 = fadeInStartKeyframe2 + 1.0;
    
    // Calculate fade progress for both sequences
    const fadeOutProgress = (currentKeyframe - fadeStartKeyframe) / 
                          (fadeEndKeyframe - fadeStartKeyframe);
    
    const fadeInProgress = (currentKeyframe - fadeInStartKeyframe) / 
                         (fadeInEndKeyframe - fadeInStartKeyframe);
                         
    const fadeOutProgress2 = (currentKeyframe - fadeStartKeyframe2) / 
                           (fadeEndKeyframe2 - fadeStartKeyframe2);
    
    const fadeInProgress2 = (currentKeyframe - fadeInStartKeyframe2) / 
                          (fadeInEndKeyframe2 - fadeInStartKeyframe2);
    
    // Apply fade effects for both sequences
    if (currentKeyframe >= fadeStartKeyframe && currentKeyframe <= fadeEndKeyframe) {
        // First sequence fade out
        Object.values(materials).forEach(material => {
            material.transparent = true;
            material.opacity = Math.max(0, 1 - fadeOutProgress * 5);
        });
    } else if (currentKeyframe > fadeEndKeyframe && currentKeyframe <= fadeInStartKeyframe) {
        // First sequence complete transparency
        Object.values(materials).forEach(material => {
            material.transparent = true;
            material.opacity = 0;
        });
    } else if (currentKeyframe > fadeInStartKeyframe && currentKeyframe <= fadeInEndKeyframe) {
        // First sequence fade in
        Object.values(materials).forEach(material => {
            material.transparent = true;
            material.opacity = Math.min(1, fadeInProgress * 2);
        });
    } else if (currentKeyframe >= fadeStartKeyframe2 && currentKeyframe <= fadeEndKeyframe2) {
        // Second sequence fade out
        Object.values(materials).forEach(material => {
            material.transparent = true;
            material.opacity = Math.max(0, 1 - fadeOutProgress2 * 5);
        });
    } else if (currentKeyframe > fadeEndKeyframe2 && currentKeyframe <= fadeInStartKeyframe2) {
        // Second sequence complete transparency
        Object.values(materials).forEach(material => {
            material.transparent = true;
            material.opacity = 0;
        });
    } else if (currentKeyframe > fadeInStartKeyframe2 && currentKeyframe <= fadeInEndKeyframe2) {
        // Second sequence fade in
        Object.values(materials).forEach(material => {
            material.transparent = true;
            material.opacity = Math.min(1, fadeInProgress2 * 2);
        });
    } else {
        // Normal state
        Object.values(materials).forEach(material => {
            material.transparent = true;
            material.opacity = 1;
        });
    }
    // Update pulsing effect for press mesh
    if (pulsingMaterial.current && pressRef.current) {
      pulsingMaterial.current.uniforms.uTime.value += delta * 2; // Increased speed

      // Adjusted pulse timing
      const pulseStartKeyframe = 8.5;
      const pulseEndKeyframe = 9.5;
      
      if (currentKeyframe >= pulseStartKeyframe && currentKeyframe <= pulseEndKeyframe) {
        const pulseProgress = (currentKeyframe - pulseStartKeyframe) / 
                            (pulseEndKeyframe - pulseStartKeyframe);
        
        // Enhanced pulse intensity
        pulsingMaterial.current.uniforms.uPulseIntensity.value = 
          Math.sin(pulseProgress * Math.PI) * 1.5; // Increased intensity
        
        // Ensure press mesh is using pulsing material
        if (pressRef.current.material !== pulsingMaterial.current) {
          pressRef.current.material = pulsingMaterial.current;
        }
      } else {
        pulsingMaterial.current.uniforms.uPulseIntensity.value = 0;
        // Reset to original material when not pulsing
        if (pressRef.current.material !== materials['Surprise ']) {
          pressRef.current.material = materials['Surprise '];
        }
      }
    }

    let localProgress = (scrollProgress * numberOfKeyframes) % 1
    localProgress = easing.easeInOut(localProgress)

    const currentCameraKeyframe = cameraKeyframes[keyframeIndex]
    const nextCameraKeyframe = cameraKeyframes[Math.min(keyframeIndex + 1, numberOfKeyframes)]
    
    // Smoothly interpolate FOV
    const targetFOV = THREE.MathUtils.lerp(
      currentCameraKeyframe.fov,
      nextCameraKeyframe.fov,
      localProgress
    )
    cameraRef.current.fov = THREE.MathUtils.lerp(
      cameraRef.current.fov,
      targetFOV,
      0.1
    )

    // Smoothly interpolate position
    const targetPosition = new THREE.Vector3()
    targetPosition.lerpVectors(
      new THREE.Vector3(...currentCameraKeyframe.position),
      new THREE.Vector3(...nextCameraKeyframe.position),
      localProgress
    )
    cameraRef.current.position.lerp(targetPosition, 0.1)

    // Smoothly interpolate rotation using quaternions
    const currentRotation = new THREE.Euler(...currentCameraKeyframe.rotation)
    const nextRotation = new THREE.Euler(...nextCameraKeyframe.rotation)
    const currentQuaternion = new THREE.Quaternion().setFromEuler(currentRotation)
    const nextQuaternion = new THREE.Quaternion().setFromEuler(nextRotation)
    const targetQuaternion = new THREE.Quaternion()
    targetQuaternion.slerpQuaternions(
      currentQuaternion,
      nextQuaternion,
      localProgress
    )
    cameraRef.current.quaternion.slerp(targetQuaternion, 0.1)

    // Mesh animations with smooth transitions
    // Clip animation
    const clipRotation = getInterpolatedRotation(
      meshAnimations.clip, 
      currentKeyframe,
      easing.easeOut
    )
    const currentClipRotation = new THREE.Vector3(...clipRef.current.rotation.toArray())
    const targetClipRotation = new THREE.Vector3(...clipRotation)
    currentClipRotation.lerp(targetClipRotation, 0.1)
    clipRef.current.rotation.set(currentClipRotation.x, currentClipRotation.y, currentClipRotation.z)

    // Lid animation
    const lidRotation = getInterpolatedRotation(
      meshAnimations.lid, 
      currentKeyframe,
      easing.bounce
    )
    const currentLidRotation = new THREE.Vector3(...lidRef.current.rotation.toArray())
    const targetLidRotation = new THREE.Vector3(...lidRotation)
    currentLidRotation.lerp(targetLidRotation, 0.1)
    lidRef.current.rotation.set(currentLidRotation.x, currentLidRotation.y, currentLidRotation.z)

    // Press animation
    const pressPosition = getInterpolatedPosition(
      meshAnimations.press, 
      currentKeyframe,
      easing.easeInOut
    )
    pressRef.current.position.lerp(new THREE.Vector3(...pressPosition), 0.1)

    // Card group animation
    const cardPosition = getInterpolatedPosition(
      meshAnimations.cardGroup, 
      currentKeyframe,
      easing.easeInOut
    )
    cardGroupRef.current.position.lerp(new THREE.Vector3(...cardPosition), 0.1)

    // Tear group animation
    const tearRotation = getInterpolatedRotation(
      meshAnimations.tearGroup, 
      currentKeyframe,
      easing.easeInOut
    )
    const currentTearRotation = new THREE.Vector3(...tearGroupRef.current.rotation.toArray())
    const targetTearRotation = new THREE.Vector3(...tearRotation)
    currentTearRotation.lerp(targetTearRotation, 0.1)
    tearGroupRef.current.rotation.set(currentTearRotation.x, currentTearRotation.y, currentTearRotation.z)

    cameraRef.current.updateProjectionMatrix()
})
  return (
    <group {...props} dispose={null}>
           <group>
      <group position={[-0.022, 0.044, 2.717]} scale={1.002} ref={tearGroupRef}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.tear_1.geometry}
          material={materials['Surprise ']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.tear_2.geometry}
          material={materials['Material.003']}
        />
      </group>
      <mesh
      ref={pressRef}
        castShadow
        receiveShadow
        geometry={nodes.press.geometry}
        material={materials['Surprise ']}
        position={[-0.013, 0.040, 2.743]}
        rotation={[3.13, 0.01, -3.141]}
        scale={[0.026, 0.034, 0.025]}
      />
      <group position={[-0.012, 0.007, 2.586]} rotation={[-Math.PI, 0.01, -Math.PI]} scale={1.002}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube002_1.geometry}
          material={materials['Surprise ']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube002_2.geometry}
          material={materials['Material.005']}
        />
      </group>
      <group
        position={[-0.012, 0.044, 2.743]}
        rotation={[3.137, -0.435, -3.134]}
        scale={[1.606, 1.198, 1.606]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Whole_1.geometry}
          material={materials['Surprise ']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Whole_2.geometry}
          material={materials['Material.005']}
        />
      </group>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane007.geometry}
        material={materials['Surprise ']}
        position={[0.205, 0.007, 2.219]}
        rotation={[0, -0.01, 0]}
        scale={[1.013, 1.002, 1.002]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube003.geometry}
        material={materials['Surprise ']}
        position={[-0.012, 0.005, 2.559]}
        rotation={[0, -0.01, 0]}
        scale={[0.998, 1.041, 1.002]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.clip001.geometry}
        material={materials['Surprise ']}
        position={[-0.015, 0.006, 2.405]}
        scale={[0.066, 0.052, 0.02]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane001.geometry}
        material={materials['Surprise ']}
        position={[-0.008, 0.007, 2.217]}
        rotation={[0, -0.01, 0]}
        scale={[1.013, 1.002, 1.002]}
      />
      <group position={[-0.005, 0.042, 2.549]} ref={cardGroupRef} rotation={[-0.005, 0.091, 3.141]} scale={0.018}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.card3001.geometry}
          material={materials['card_Mat.001']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.card3001_1.geometry}
          material={materials['material_0.001']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.card3001_2.geometry}
          material={materials['SVGMat.001']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.card3001_3.geometry}
          material={materials['lambert2.001']}
        />
      </group>
      </group>
      <group position={[0, 0.005, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube006.geometry}
          material={materials['Zino classic.001']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube006_1.geometry}
          material={materials['White Part.001']}
        />
      </group>
      <mesh
      ref={clipRef}
        castShadow
        receiveShadow
        geometry={nodes.clip.geometry}
        material={materials['Zino classic.001']}
        position={[0.008, 0.002, -0.153]}
        scale={[0.06, 0.052, 0.02]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane012.geometry}
        material={materials['Zino classic.001']}
        position={[0.005, 0.005, -0.341]}
      />
      <mesh
      ref={lidRef}
        castShadow
        receiveShadow
        geometry={nodes.lid.geometry}
        material={materials['Zino classic.001']}
        position={[0.003, 0.041, 0.187]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube004.geometry}
        material={materials['Material.002']}
        position={[0, 0.002, 0]}
        scale={[1, 1.086, 1]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube005.geometry}
        material={materials['White Part.001']}
        position={[0.013, 0.027, -0.152]}
        rotation={[0, -0.002, 0]}
        scale={[1.001, 1.052, 0.346]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane004.geometry}
        material={materials['Zino classic.001']}
        position={[0.208, 0.005, -0.341]}
      />
      <PerspectiveCamera
ref={cameraRef}        makeDefault={true}
        far={1000}
        near={0.1}
        fov={22.895}
        position={[0.067, 3.329, -4.178]}
        rotation={[-2.477, -0.004, -3.138]}
      />
    </group>
  )
}

useGLTF.preload('/stage.glb')
