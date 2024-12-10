import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Pizza(props) {
  const { nodes, materials } = useGLTF('/pizzaglb.glb')
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_5.geometry}
        material={materials['default']}
        position={[-0.001, 0.023, -0.003]}
        rotation={[0, -0.97, 0]}
        scale={[0.15, 0.082, 0.15]}
      />
    </group>
  )
}

useGLTF.preload('/pizzaglb.glb')
