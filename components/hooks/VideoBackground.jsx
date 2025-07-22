// components/VideoBackground.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useFBO, useTexture, useVideoTexture } from '@react-three/drei';
import * as THREE from 'three';
import useMouse from '../hooks/useMouse';
import useDimension from '../hooks/useDimension';
import { vertex } from '../hooks/vertex';  // Add this import
import { fragment } from '../hooks/fragment';  // Add this import

export default function VideoBackground() {
  const { viewport } = useThree();
  const brushTexture = useTexture('/brush.png');
  const videoTexture = useVideoTexture('/s.mp4', {
    loop: true,
    muted: true,
    start: true,
    crossOrigin: 'Anonymous',
  });
  
  const meshRefs = useRef([]);
  const [meshes, setMeshes] = useState([]);
  const mouse = useMouse();
  const device = useDimension();
  const [prevMouse, setPrevMouse] = useState({ x: 0, y: 0 });
  const [currentWave, setCurrentWave] = useState(0);
  const { gl, camera } = useThree();

  const scene = new THREE.Scene();
  const max = 100;

  const uniforms = useRef({
    uDisplacement: { value: null },
    uTexture: { value: videoTexture },
    winResolution: {
      value: new THREE.Vector2(0, 0),
    },
    uTime: { value: 0 }
  });

  const fboBase = useFBO(device.width, device.height);

  useEffect(() => {
    const generatedMeshes = Array.from({ length: max }).map((_, i) => (
      <mesh
        key={i}
        position={[0, 0, 0]}
        ref={el => (meshRefs.current[i] = el)}
        rotation={[0, 0, Math.random()]}
        visible={false}
      >
        <planeGeometry args={[60, 60, 1, 1]} />
        <meshBasicMaterial
          transparent={true}
          map={brushTexture}
          color={0xffffff}
        />
      </mesh>
    ));
    setMeshes(generatedMeshes);

    return () => {
      meshRefs.current.forEach(mesh => {
        if (mesh?.geometry) mesh.geometry.dispose();
        if (mesh?.material) mesh.material.dispose();
      });
    };
  }, [brushTexture]);

  function setNewWave(x, y, currentWave) {
    const mesh = meshRefs.current[currentWave];
    if (mesh) {
      mesh.position.x = x;
      mesh.position.y = y;
      mesh.visible = true;
      mesh.material.opacity = 0.86;
      mesh.scale.x = 2.0;
      mesh.scale.y = 2.0;
      mesh.material.color.setRGB(1.0, 1.0, 1.0);
    }
  }

  function trackMousePos(x, y) {
    if (Math.abs(x - prevMouse.x) > 0.1 || Math.abs(y - prevMouse.y) > 0.1) {
      setCurrentWave((currentWave + 1) % max);
      setNewWave(x, y, currentWave);
    }
    setPrevMouse({ x, y });
  }

  useFrame(({ clock, gl, scene: finalScene }) => {
    const x = mouse.x - device.width / 2;
    const y = -mouse.y + device.height / 2;
    trackMousePos(x, y);

    if (uniforms.current) {
      uniforms.current.uTime.value = clock.getElapsedTime();
    }

    meshRefs.current.forEach(mesh => {
      if (mesh?.visible) {
        mesh.rotation.z += 0.025;
        mesh.material.opacity *= 0.95;
        mesh.scale.x = 0.98 * mesh.scale.x + 0.155;
        mesh.scale.y = 0.98 * mesh.scale.y + 0.155;
      }
    });

    if (device.width > 0 && device.height > 0) {
      gl.setRenderTarget(fboBase);
      gl.clear();
      meshRefs.current.forEach(mesh => {
        if (mesh?.visible) {
          scene.add(mesh);
        }
      });
      gl.render(scene, camera);
      meshRefs.current.forEach(mesh => {
        if (mesh?.visible) {
          scene.remove(mesh);
        }
      });

      if (uniforms.current) {
        uniforms.current.uDisplacement.value = fboBase.texture;
        uniforms.current.winResolution.value
          .set(device.width, device.height)
          .multiplyScalar(device.pixelRatio);
      }

      gl.setRenderTarget(null);
      gl.render(finalScene, camera);
    }
  });

  return (

    <group>
      {meshes}
      <mesh>
        <planeGeometry args={[device.width, device.height, 1, 1]} />
        <shaderMaterial
          vertexShader={vertex}
          fragmentShader={fragment}
          transparent={true}
          uniforms={uniforms.current}
        />
      </mesh>
    </group>
  );
}