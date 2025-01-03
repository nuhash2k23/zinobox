// import React, { useRef, useEffect, useState } from 'react';
// import { useFrame, useThree } from '@react-three/fiber';
// import { useFBO, useTexture } from '@react-three/drei';
// import * as THREE from 'three';
// import useMouse from '../hooks/useMouse';
// import useDimension from '../hooks/useDimension';
// import { vertex } from '../hooks/vertex';
// import { fragment } from '../hooks/fragment';

// export default function Model() {
//   const { viewport } = useThree();
//   const texture = useTexture('/brush.png');
//   const meshRefs = useRef([]);
//   const [meshes, setMeshes] = useState([]);
//   const mouse = useMouse();
//   const device = useDimension();
//   const [prevMouse, setPrevMouse] = useState({ x: 0, y: 0 });
//   const [currentWave, setCurrentWave] = useState(0);
//   const { gl, camera } = useThree();

//   const scene = new THREE.Scene();
//   const max = 100;

//   const uniforms = useRef({
//     uDisplacement: { value: null },
//     uTexture: { value: null },
//     winResolution: {
//       value: new THREE.Vector2(0, 0),
//     },
//     uTime: { value: 0 }
//   });

//   const materialRef = useRef();
//   const fboBase = useFBO(device.width, device.height);
//   const fboTexture = useFBO(device.width, device.height);

//   const { scene: imageScene, camera: imageCamera, material: gradientMaterial } = GradientMesh(viewport);

//   useEffect(() => {
//     materialRef.current = gradientMaterial;
//   }, [gradientMaterial]);

//   useEffect(() => {
//     const generatedMeshes = Array.from({ length: max }).map((_, i) => (
//       <mesh
//         key={i}
//         position={[0, 0, 0]}
//         ref={el => (meshRefs.current[i] = el)}
//         rotation={[0, 0, Math.random()]}
//         visible={false}
//       >
//         <planeGeometry args={[60, 60, 1, 1]} />
//         <meshBasicMaterial 
//           transparent={true} 
//           map={texture}
//           color={0xffffff}  // Set to white
//         />
//       </mesh>
//     ));
//     setMeshes(generatedMeshes);
  
//     return () => {
//       meshRefs.current.forEach(mesh => {
//         if (mesh?.geometry) mesh.geometry.dispose();
//         if (mesh?.material) mesh.material.dispose();
//       });
//     };
//   }, [texture]);

//   function setNewWave(x, y, currentWave) {
//     const mesh = meshRefs.current[currentWave];
//     if (mesh) {
//       mesh.position.x = x;
//       mesh.position.y = y;
//       mesh.visible = true;
//       mesh.material.opacity = 0.6; // More transparent
//       mesh.scale.x = 3.0;  // Larger area of effect
//       mesh.scale.y = 3.0;
//       // Nearly invisible material color
//       mesh.material.color.setRGB(1.0, 1.0, 1.0);
//     }
//   }
//   function trackMousePos(x, y) {
//     if (Math.abs(x - prevMouse.x) > 0.1 || Math.abs(y - prevMouse.y) > 0.1) {
//       setCurrentWave((currentWave + 1) % max);
//       setNewWave(x, y, currentWave);
//     }
//     setPrevMouse({ x, y });
//   }

//   useFrame(({ clock, gl, scene: finalScene }) => {
//     const x = mouse.x - device.width / 2;
//     const y = -mouse.y + device.height / 2;
//     trackMousePos(x, y);

//     if (uniforms.current) {
//       uniforms.current.uTime.value = clock.getElapsedTime();
//     }
    
//     if (materialRef.current) {
//       materialRef.current.uniforms.time.value = clock.getElapsedTime();
//     }

//     meshRefs.current.forEach(mesh => {
//       if (mesh?.visible) {
//         mesh.rotation.z += 0.025;
//         mesh.material.opacity *= 0.95;
//         mesh.scale.x = 0.98 * mesh.scale.x + 0.155;
//         mesh.scale.y = 0.98 * mesh.scale.y + 0.155;
//       }
//     });

//     if (device.width > 0 && device.height > 0) {
//       gl.setRenderTarget(fboBase);
//       gl.clear();
//       meshRefs.current.forEach(mesh => {
//         if (mesh?.visible) {
//           scene.add(mesh);
//         }
//       });
//       gl.render(scene, camera);
//       meshRefs.current.forEach(mesh => {
//         if (mesh?.visible) {
//           scene.remove(mesh);
//         }
//       });
      
//       if (uniforms.current) {
//         uniforms.current.uTexture.value = fboTexture.texture;
//         uniforms.current.uDisplacement.value = fboBase.texture;
//         uniforms.current.winResolution.value.set(
//           device.width,
//           device.height
//         ).multiplyScalar(device.pixelRatio);
//       }

//       gl.setRenderTarget(fboTexture);
//       gl.render(imageScene, imageCamera);

//       gl.setRenderTarget(null);
//       gl.render(finalScene, camera);
//     }
//   });

//   function GradientMesh(viewport) {
//     const scene = new THREE.Scene();
//     const camera = new THREE.OrthographicCamera(
//       viewport.width / -2,
//       viewport.width / 2,
//       viewport.height / 2,
//       viewport.height / -2,
//       -1000,
//       1000
//     );
//     camera.position.z = 2;
//     scene.add(camera);

//     const geometry = new THREE.PlaneGeometry(viewport.width, viewport.height);

//     const material = new THREE.ShaderMaterial({
//       vertexShader: `
//         varying vec2 vUv;
//         void main() {
//           vUv = uv;
//           gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//         }
//       `,
//       fragmentShader: `
//       varying vec2 vUv;
//       uniform float time;
    
//       float smoothTransition(float edge0, float edge1, float x) {
//         float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
//         return t * t * (3.0 - 2.0 * t);
//       }
    
//       float organicNoise(vec2 st) {
//         vec2 i = floor(st);
//         vec2 f = fract(st);
        
//         float a = sin(dot(i, vec2(12.9898, 78.233)) * 43758.5453123);
//         float b = sin(dot(i + vec2(1.0, 0.0), vec2(12.9898, 78.233)) * 43758.5453123);
//         float c = sin(dot(i + vec2(0.0, 1.0), vec2(12.9898, 78.233)) * 43758.5453123);
//         float d = sin(dot(i + vec2(1.0, 1.0), vec2(12.9898, 78.233)) * 43758.5453123);
    
//         vec2 u = f * f * (3.0 - 2.0 * f);
    
//         return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
//       }
    
//       void main() {
//         vec2 uv = vUv;
    
//         vec3 brightBlue = vec3(0.0, 0.114, 1.0);     // #001DFF
//         vec3 lightBlue = vec3(0.318, 0.82, 1.0);     // #51D1FF
//         vec3 darkestBlue = vec3(0.0, 0.019, 0.157);  // #000528
//         vec3 mediumBlue = vec3(0.0, 0.037, 0.580);   // #000994
        
//         float t = time * 0.362;
    
//         vec2 distortedUV = uv;
//         distortedUV += vec2(
//             organicNoise(uv * 0.50 + t * 0.5) * 0.2,
//             organicNoise(uv * 0.90 - t * 0.4) * 0.2
//         );
    
//         float flow1 = organicNoise(distortedUV * 2.5 + t * 0.3);
//         float flow2 = organicNoise((distortedUV + vec2(0.5)) * 2.0 - t * 0.4);
        
//         float organicFlow = organicNoise(vec2(
//             distortedUV.x * 2.0 + sin(t * 0.2) + flow1,
//             distortedUV.y * 2.0 + cos(t * 0.3) + flow2
//         ));
    
//         float blend = flow1 * 0.4 + flow2 * 0.3 + organicFlow * 0.3;
//         blend = smoothTransition(-2.0, 1.70, blend);
    
//         float mask1 = smoothTransition(0.2, 0.8, blend + organicNoise(uv + t * 0.2) * 0.2);
//         float mask2 = smoothTransition(0.3, 0.9, blend + organicNoise(uv - t * 0.2) * 0.2);
    
//         float colorMix = organicNoise(distortedUV + t * 0.1) * 0.5 + blend * 0.5;
//         colorMix = smoothTransition(-0.48, 1.30, colorMix);
        
//         vec3 finalColor;
        
//         float trans1 = smoothTransition(0.1, 0.4, colorMix + organicNoise(uv + t * 0.15) * 0.15);
//         float trans2 = smoothTransition(0.3, 0.6, colorMix + organicNoise(uv - t * 0.2) * 0.15);
//         float trans3 = smoothTransition(0.5, 0.8, colorMix + organicNoise(uv + t * 0.25) * 0.15);
        
//         finalColor = mix(darkestBlue, mediumBlue, trans1);
//         finalColor = mix(finalColor, brightBlue, trans2);
//         finalColor = mix(finalColor, lightBlue, trans3);
    
//         gl_FragColor = vec4(finalColor, 1.0);
//       }
//     `,
//       transparent: true,
//       uniforms: {
//         time: { value: 0 }
//       }
//     });

//     const mesh = new THREE.Mesh(geometry, material);
//     scene.add(mesh);

//     return { scene, camera, material };
//   }

//   return (
//     <group>
//       {meshes}
//       <mesh>
//         <planeGeometry args={[device.width, device.height, 1, 1]} />
//         <shaderMaterial
//           vertexShader={vertex}
//           fragmentShader={fragment}
//           transparent={true}
//           uniforms={uniforms.current}
//         />
//       </mesh>
//     </group>
//   );
// }

import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useFBO, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import useMouse from '../hooks/useMouse';
import useDimension from '../hooks/useDimension';
import { vertex } from '../hooks/vertex';
import { fragment } from '../hooks/fragment';

export default function Model() {
  const { viewport } = useThree();
  const texture = useTexture('/brush.png');
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
    uTexture: { value: null },
    winResolution: {
      value: new THREE.Vector2(0, 0),
    },
    uTime: { value: 0 },
  });

  const materialRef = useRef();
  const fboBase = useFBO(device.width, device.height);
  const fboTexture = useFBO(device.width, device.height);

  const {
    scene: imageScene,
    camera: imageCamera,
    material: gradientMaterial,
  } = GradientMesh(viewport);

  useEffect(() => {
    materialRef.current = gradientMaterial;
  }, [gradientMaterial]);

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
          map={texture}
          color={0xffffff} // Set to white
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
  }, [texture]);

  function setNewWave(x, y, currentWave) {
    const mesh = meshRefs.current[currentWave];
    if (mesh) {
      mesh.position.x = x;
      mesh.position.y = y;
      mesh.visible = true;
      mesh.material.opacity = 0.6; // More transparent
      mesh.scale.x = 3.0; // Larger area of effect
      mesh.scale.y = 3.0;
      // Nearly invisible material color
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

    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
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
        uniforms.current.uTexture.value = fboTexture.texture;
        uniforms.current.uDisplacement.value = fboBase.texture;
        uniforms.current.winResolution.value
          .set(device.width, device.height)
          .multiplyScalar(device.pixelRatio);
      }

      gl.setRenderTarget(fboTexture);
      gl.render(imageScene, imageCamera);

      gl.setRenderTarget(null);
      gl.render(finalScene, camera);
    }
  });

  function GradientMesh(viewport) {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      viewport.width / -2,
      viewport.width / 2,
      viewport.height / 2,
      viewport.height / -2,
      -1000,
      1000
    );
    camera.position.z = 2;
    scene.add(camera);

    const geometry = new THREE.PlaneGeometry(viewport.width, viewport.height);

    const material = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
      varying vec2 vUv;
      uniform float time;
    
      float smoothTransition(float edge0, float edge1, float x) {
        float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
      }
    
      float organicNoise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        
        float a = sin(dot(i, vec2(12.9898, 78.233)) * 43758.5453123);
        float b = sin(dot(i + vec2(1.0, 0.0), vec2(12.9898, 78.233)) * 43758.5453123);
        float c = sin(dot(i + vec2(0.0, 1.0), vec2(12.9898, 78.233)) * 43758.5453123);
        float d = sin(dot(i + vec2(1.0, 1.0), vec2(12.9898, 78.233)) * 43758.5453123);
    
        vec2 u = f * f * (3.0 - 2.0 * f);
    
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
    
      void main() {
        vec2 uv = vUv;
    
        vec3 brightBlue = vec3(0.0, 0.114, 1.0);     // #001DFF
        vec3 lightBlue = vec3(0.318, 0.82, 1.0);     // #51D1FF
        vec3 darkestBlue = vec3(0.0, 0.019, 0.157);  // #000528
        vec3 mediumBlue = vec3(0.0, 0.037, 0.580);   // #000994
        
        float t = time * 0.5;
    
        vec2 distortedUV = uv;
        distortedUV += vec2(
            organicNoise(uv * 0.50 + t * 0.5) * 0.2,
            organicNoise(uv * 0.90 - t * 0.4) * 0.2
        );
    
        float flow1 = organicNoise(distortedUV * 2.5 + t * 0.3);
        float flow2 = organicNoise((distortedUV + vec2(0.5)) * 2.0 - t * 0.4);
        
        float organicFlow = organicNoise(vec2(
            distortedUV.x * 2.0 + sin(t * 0.2) + flow1,
            distortedUV.y * 2.0 + cos(t * 0.3) + flow2
        ));
    
        float blend = flow1 * 0.4 + flow2 * 0.3 + organicFlow * 0.3;
        blend = smoothTransition(-2.0, 1.70, blend);
    
        float mask1 = smoothTransition(0.2, 0.8, blend + organicNoise(uv + t * 0.2) * 0.2);
        float mask2 = smoothTransition(0.3, 0.9, blend + organicNoise(uv - t * 0.2) * 0.2);
    
        float colorMix = organicNoise(distortedUV + t * 0.1) * 0.5 + blend * 0.5;
        colorMix = smoothTransition(-0.48, 1.30, colorMix);
        
        vec3 finalColor;
        
        float trans1 = smoothTransition(0.1, 0.4, colorMix + organicNoise(uv + t * 0.15) * 0.15);
        float trans2 = smoothTransition(0.3, 0.6, colorMix + organicNoise(uv - t * 0.2) * 0.15);
        float trans3 = smoothTransition(0.5, 0.8, colorMix + organicNoise(uv + t * 0.25) * 0.15);
        
        finalColor = mix(darkestBlue, mediumBlue, trans1);
        finalColor = mix(finalColor, brightBlue, trans2);
        finalColor = mix(finalColor, lightBlue, trans3);
    
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
      transparent: true,
      uniforms: {
        time: { value: 0 },
      },
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return { scene, camera, material };
  }

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
