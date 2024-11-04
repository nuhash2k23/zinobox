
import React, { useRef } from 'react'
import { useGLTF, PerspectiveCamera, useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Scene(props) {
  const { nodes, materials } = useGLTF('/stage.glb')
  const scroll = useScroll()
  const cameraRef = useRef()
  const lidRef = useRef()
  const clipRef = useRef()
  const pressRef = useRef()
const tearGroupRef = useRef()
const cardGroupRef = useRef()

  // Camera keyframes
  const cameraKeyframes = [
    {
      fov: 54.409,
      position: [0.885, -0.029, -0.913],
      rotation: [3.111, 0.768, -3.12],
    },
    {
      fov: 60.743,
      position: [-0.408, -0.033, -0.456],
      rotation: [-2.747, -0.731, -2.87],
    },
    {
      fov: 130.52,
      position: [0.375, 0.304, -0.496],
      rotation: [-2.491, 0.521, 2.642],
    },
    {
      fov: 97.52,
      position: [0.277, 0.036, -0.346],
      rotation: [-2.462, 0.522, 2.759],
    },
    {
      fov: 90.52,
      position: [-0.317, 1.416, -0.442],
      rotation: [-2.787, -0.58, -2.773],
    },
    {
      fov: 20.646,
      position: [-0.104, 1.392, -0.264],
      rotation: [-2.267, -0.394, -2.711],
    },
    {
      fov: 130.91,
      position: [-0.104, 1.492, -0.264],
      rotation: [-2.283, -0.13, -2.591],
    },
    {
      fov: 0.5,
      position: [0.796, 0.721, -3.554],
      rotation: [-2.981, 0.49, 2.695],
    },
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
      { rotation: [0, -0.002, 0], keyframe: 2 },
      { rotation: [1.344, 0, 0], keyframe: 3 },
      { rotation: [1.344, 0, 0], keyframe: 7 },
    ],
    clip: [
      { rotation: [0, -0.002, 0], keyframe: 0 },
      { rotation: [0, -0.002, 0], keyframe: 1.5 },
      { rotation: [-1.37, 0, 0], keyframe: 2.5 },
      { rotation: [-1.37, 0, 0], keyframe: 7 },
    ],
    press: [
      { position: [-0.0015, 1.202, 0.188], keyframe: 0 },
      { position: [-0.0015, 1.202, 0.188], keyframe: 4.5 },
      { position: [-0.0015, 1.199, 0.188], keyframe: 5 },
      { position: [-0.0015, 1.201, 0.188], keyframe: 7 },
    ],
    tearGroup: [
      { rotation: [0, 0, 0], keyframe: 0 },
      { rotation: [0, 0, 0], keyframe: 5 },
      { rotation: [1.472, 0, 0], keyframe: 5.5 },
      { rotation: [1.472, 0, 0], keyframe: 7 },
    ],
    cardGroup: [
      { position: [0.005, 1.202, -0.009], keyframe: 0 },
      { position: [0.005, 1.202, -0.009], keyframe: 5.2 },
      { position: [0.005, 1.402, -0.009], keyframe: 5.7 }, // Adjust these coordinates as needed
      { position: [0.005, 1.402, -0.009], keyframe: 7 },
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



  // Animation frame
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
    
    let localProgress = (scrollProgress * numberOfKeyframes) % 1
    localProgress = easing.easeInOut(localProgress)

    const currentCameraKeyframe = cameraKeyframes[keyframeIndex]
    const nextCameraKeyframe = cameraKeyframes[Math.min(keyframeIndex + 1, numberOfKeyframes)]

    // If we're at the start (scrollProgress near 0), use exact initial values
    if (scrollProgress < 0.001) {
      cameraRef.current.fov = cameraKeyframes[0].fov
      cameraRef.current.position.set(...cameraKeyframes[0].position)
      cameraRef.current.rotation.set(...cameraKeyframes[0].rotation)
      
      // Reset all meshes to initial positions
      clipRef.current.rotation.set(...meshAnimations.clip[0].rotation)
      lidRef.current.rotation.set(...meshAnimations.lid[0].rotation)
  
      tearGroupRef.current.rotation.set(...meshAnimations.tearGroup[0].rotation)
      pressRef.current.position.set(...meshAnimations.press[0].position)
      cardGroupRef.current.position.set(...meshAnimations.cardGroup[0].position)
    } else {
      // Camera FOV
      cameraRef.current.fov = THREE.MathUtils.lerp(
        currentCameraKeyframe.fov,
        nextCameraKeyframe.fov,
        localProgress
      )

      // Camera position
      cameraRef.current.position.lerp(
        new THREE.Vector3(...nextCameraKeyframe.position),
        localProgress
      )

      // Camera rotation
      const currentRotation = new THREE.Euler(...currentCameraKeyframe.rotation)
      const nextRotation = new THREE.Euler(...nextCameraKeyframe.rotation)
      const currentQuaternion = new THREE.Quaternion().setFromEuler(currentRotation)
      const nextQuaternion = new THREE.Quaternion().setFromEuler(nextRotation)
      const interpolatedQuaternion = new THREE.Quaternion()
      interpolatedQuaternion.slerpQuaternions(
        currentQuaternion,
        nextQuaternion,
        localProgress
      )
      cameraRef.current.quaternion.copy(interpolatedQuaternion)

      // Mesh animations
      // Clip animation
      const clipRotation = getInterpolatedRotation(
        meshAnimations.clip, 
        currentKeyframe,
        easing.easeOut
      )
      clipRef.current.rotation.set(...clipRotation)

      // Lid animation
      const lidRotation = getInterpolatedRotation(
        meshAnimations.lid, 
        currentKeyframe,
        easing.bounce
      )
      lidRef.current.rotation.set(...lidRotation)

      // Press animation
      const pressPosition = getInterpolatedPosition(
        meshAnimations.press, 
        currentKeyframe,
        easing.easeInOut // Using easeInOut instead of bounce
      )
      pressRef.current.position.set(...pressPosition)
    
      // Card group animation (position)
      const cardPosition = getInterpolatedPosition(
        meshAnimations.cardGroup, 
        currentKeyframe,
        easing.easeInOut // Using easeInOut instead of bounce
      )
      cardGroupRef.current.position.set(...cardPosition)
    
      // Tear group animation (with smoother easing)
      const tearRotation = getInterpolatedRotation(
        meshAnimations.tearGroup, 
        currentKeyframe,
        easing.easeInOut // Changed from bounce to easeInOut
      )
      tearGroupRef.current.rotation.set(...tearRotation)
    }

    cameraRef.current.updateProjectionMatrix()
  })

  return (
    <group {...props} dispose={null}>
      <group position={[-0.011, 1.203, 0.158]} scale={1.002} ref={tearGroupRef}>
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
        position={[-0.0015, 1.200, 0.188]}
        rotation={[3.13, 0.01, -3.141]}
        scale={[0.026, 0.025, 0.025]}
      />
      <group position={[-0.001, 1.167, 0.027]} rotation={[-Math.PI, 0.01, -Math.PI]} scale={1.002}>
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
        position={[-0.002, 1.203, 0.185]}
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
        position={[0.215, 1.167, -0.339]}
        rotation={[0, -0.01, 0]}
        scale={[1.013, 1.002, 1.002]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube003.geometry}
        material={materials['Surprise ']}
        position={[-0.001, 1.165, 0]}
        rotation={[0, -0.01, 0]}
        scale={[0.998, 1.041, 1.002]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.clip001.geometry}
        material={materials['Surprise ']}
        position={[-0.004, 1.166, -0.154]}
        scale={[0.066, 0.052, 0.02]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane001.geometry}
        material={materials['Surprise ']}
        position={[0.002, 1.167, -0.342]}
        rotation={[0, -0.01, 0]}
        scale={[1.013, 1.002, 1.002]}
      />
      <group position={[0.005, 1.202, -0.009]} rotation={[-0.005, 0.091, 3.141]} scale={0.018} ref={cardGroupRef}>
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
      <group position={[0, -0.229, 0]}>
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
        position={[0.008, -0.232, -0.153]}
        scale={[0.06, 0.052, 0.02]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane012.geometry}
        material={materials['Zino classic.001']}
        position={[0.005, -0.229, -0.341]}
      />
      <mesh
      ref={lidRef}
        castShadow
        receiveShadow
        geometry={nodes.lid.geometry}
        material={materials['Zino classic.001']}
        position={[0.003, -0.193, 0.187]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube004.geometry}
        material={materials['Material.002']}
        position={[0, -0.231, 0]}
        scale={[1, 1.086, 1]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube005.geometry}
        material={materials['White Part.001']}
        position={[0.013, -0.207, -0.152]}
        rotation={[0, -0.002, 0]}
        scale={[1.001, 1.052, 0.346]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane004.geometry}
        material={materials['Zino classic.001']}
        position={[0.208, -0.229, -0.341]}
      />
 <PerspectiveCamera
        ref={cameraRef}
        makeDefault={true}
        far={1000}
        near={0.1}
        fov={28.409}
        position={[0.885, -0.029, -0.913]}
        rotation={[3.111, 0.768, -3.12]}
      />
    </group>
  )
}

useGLTF.preload('/stage.glb')
