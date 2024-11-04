import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Classic(props) {
  const { nodes, materials } = useGLTF('/CLASSIC.glb')
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.clip.geometry}
        material={materials['Zino classic']}
        position={[0.008, -0.003, -0.153]}
        rotation={[1.563, -0.003, 0]}
        scale={[0.06, 0.052, 0.02]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane012.geometry}
        material={materials['Zino classic']}
        position={[0.005, 0, -0.341]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.lid.geometry}
        material={materials['Zino classic']}
        position={[0.003, 0.036, 0.187]}
        rotation={[3.142, 0.001, Math.PI]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube002.geometry}
        material={materials['Material.002']}
        position={[0, -0.002, 0]}
        scale={[1, 1.086, 1]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube004.geometry}
        material={materials['White Part']}
        position={[0.013, 0.022, -0.152]}
        rotation={[0, -0.002, 0]}
        scale={[1.001, 1.052, 0.346]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane004.geometry}
        material={materials['Zino classic']}
        position={[0.208, 0, -0.341]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube005.geometry}
        material={materials['Zino classic']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube005_1.geometry}
        material={materials['White Part']}
      />
    </group>
  )
}

useGLTF.preload('/CLASSIC.glb')