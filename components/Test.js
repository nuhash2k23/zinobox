import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';

const RayMarchingScene = () => {
  const meshRef = useRef();
  const { size } = useThree();

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;

    uniform vec2 resolution;
    uniform vec3 iMouse;
    uniform float time;

    varying vec2 vUv;

    #define MAX_STEPS 100
    #define MAX_DIST 100.0
    #define SURF_DIST 0.001
    #define PI 3.14159265359

    struct Material {
        vec3 albedo;
        float metallic;
        float roughness;
        float reflectivity;
    };

    float sdBox(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
    }

    float sdCylinder(vec3 p, vec2 h) {
        vec2 d = abs(vec2(length(p.xz), p.y)) - h;
        return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
    }

    float sdTorus(vec3 p, vec2 t) {
        vec2 q = vec2(length(p.xz) - t.x, p.y);
        return length(q) - t.y;
    }

    float sdChair(vec3 p, vec3 pos) {
        p -= pos;
        
        float angle = -PI * 0.5;
        mat3 rotationMatrix = mat3(
            cos(angle), 0.0, sin(angle),
            0.0, 1.0, 0.0,
            -sin(angle), 0.0, cos(angle)
        );
        p = rotationMatrix * p;
        
        float seat = sdBox(p - vec3(0.0, 0.4, 0.0), vec3(0.4, 0.05, 0.4));
        float backrest = sdBox(p - vec3(-0.35, 0.9, 0.0), vec3(0.05, 0.5, 0.4));
        
        float leg1 = sdBox(p - vec3(0.35, 0.2, 0.35), vec3(0.05, 0.2, 0.05));
        float leg2 = sdBox(p - vec3(0.35, 0.2, -0.35), vec3(0.05, 0.2, 0.05));
        float leg3 = sdBox(p - vec3(-0.35, 0.2, 0.35), vec3(0.05, 0.2, 0.05));
        float leg4 = sdBox(p - vec3(-0.35, 0.2, -0.35), vec3(0.05, 0.2, 0.05));
        
        float chair = seat;
        chair = min(chair, backrest);
        chair = min(chair, leg1);
        chair = min(chair, leg2);
        chair = min(chair, leg3);
        chair = min(chair, leg4);
        
        return chair;
    }

    float sdCup(vec3 p, vec3 pos) {
        p -= pos;
        
        vec3 bodyP = p;
        float height = 0.15;
        float bottomRadius = 0.08;
        float topRadius = 0.1;
        
        float t = (bodyP.y + height * 0.5) / height;
        t = clamp(t, 0.0, 1.0);
        float currentRadius = mix(bottomRadius, topRadius, t);
        bodyP.xz *= bottomRadius / currentRadius;
        float body = sdCylinder(bodyP, vec2(currentRadius, height * 0.5));
        
        float innerBody = sdCylinder(bodyP, vec2(max(currentRadius - 0.01, 0.0), height * 0.5 - 0.01));
        body = max(body, -innerBody);
        
        float base = sdCylinder(p - vec3(0.0, -height * 0.45, 0.0), vec2(bottomRadius + 0.01, 0.01));
        
        vec3 handlePos = p - vec3(topRadius + 0.03, 0.0, 0.0);
        
        float handleAngle = PI * 0.5;
        mat3 handleRotation = mat3(
            1.0, 0.0, 0.0,
            0.0, cos(handleAngle), -sin(handleAngle),
            0.0, sin(handleAngle), cos(handleAngle)
        );
        
        handlePos = handleRotation * handlePos;
        
        float handleOuter = sdTorus(handlePos, vec2(0.06, 0.01));
        float handleInner = sdTorus(handlePos, vec2(0.05, 0.01));
        float handle = min(handleOuter, handleInner);
        
        vec3 connectorPos = p - vec3(topRadius, 0.03, 0.0);
        float connector1 = sdBox(connectorPos, vec3(0.03, 0.01, 0.01));
        connectorPos = p - vec3(topRadius, -0.03, 0.0);
        float connector2 = sdBox(connectorPos, vec3(0.03, 0.01, 0.01));
        
        float result = body;
        result = min(result, base);
        result = min(result, handle);
        result = min(result, connector1);
        result = min(result, connector2);
        
        return result;
    }

    float sdVase(vec3 p, vec3 pos) {
        p -= pos;
        float angle = atan(p.x, p.z);
        float r = length(p.xz);
        
        float height = 0.5;
        float radius = 0.15 + 0.05 * sin(p.y * 10.0 + time) * sin(angle * 8.0);
        radius *= 1.0 - 0.5 * smoothstep(0.0, height, p.y);
        
        vec2 q = vec2(r - radius, p.y - height * 0.5);
        return length(q) - 0.02;
    }

    vec2 sceneSDF(vec3 p) {
        vec2 res = vec2(MAX_DIST, -1.0);

        float ground = sdBox(p - vec3(0.0, -0.1, 0.0), vec3(5.0, 0.1, 5.0));
        res = ground < res.x ? vec2(ground, 0.0) : res;

        float tableTop = sdBox(p - vec3(0.0, 0.7, 0.0), vec3(1.2, 0.05, 0.8));
        float leg1 = sdBox(p - vec3(-1.1, 0.35, -0.7), vec3(0.05, 0.35, 0.05));
        float leg2 = sdBox(p - vec3(1.1, 0.35, -0.7), vec3(0.05, 0.35, 0.05));
        float leg3 = sdBox(p - vec3(-1.1, 0.35, 0.7), vec3(0.05, 0.35, 0.05));
        float leg4 = sdBox(p - vec3(1.1, 0.35, 0.7), vec3(0.05, 0.35, 0.05));
        
        float table = min(min(min(min(tableTop, leg1), leg2), leg3), leg4);
        res = table < res.x ? vec2(table, 1.0) : res;

        float chair1 = sdChair(p, vec3(-0.8, 0.0, -1.2));
        float chair2 = sdChair(p, vec3(0.8, 0.0, -1.2));
        res = chair1 < res.x ? vec2(chair1, 2.0) : res;
        res = chair2 < res.x ? vec2(chair2, 2.0) : res;

        vec3 cupPos = vec3(0.5 * sin(time), 0.85, 0.3 * cos(time));
        float cup = sdCup(p, cupPos);
        res = cup < res.x ? vec2(cup, 3.0) : res;

        float vase = sdVase(p, vec3(-0.5, 0.8, 0.0));
        res = vase < res.x ? vec2(vase, 4.0) : res;

        return res;
    }

    vec3 getNormal(vec3 p) {
        float eps = 0.001;
        vec2 h = vec2(eps, 0.0);
        return normalize(vec3(
            sceneSDF(p + h.xyy).x - sceneSDF(p - h.xyy).x,
            sceneSDF(p + h.yxy).x - sceneSDF(p - h.yxy).x,
            sceneSDF(p + h.yyx).x - sceneSDF(p - h.yyx).x
        ));
    }

    float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
        float res = 1.0;
        float ph = 1e20;
        float t = mint;
        for(int i = 0; i < 32; i++) {
            if(t >= maxt) break;
            float h = sceneSDF(ro + rd * t).x;
            if(h < 0.001) return 0.0;
            float y = h * h / (2.0 * ph);
            float d = sqrt(h * h - y * y);
            res = min(res, k * d / max(0.0, t - y));
            ph = h;
            t += h;
        }
        return res;
    }

    Material getMaterial(float id) {
        Material mat;
        if(id < 0.5) {
            mat.albedo = vec3(0.2);
            mat.metallic = 0.0;
            mat.roughness = 0.9;
            mat.reflectivity = 0.1;
        } else if(id < 1.5) {
            mat.albedo = vec3(0.6, 0.3, 0.1);
            mat.metallic = 0.0;
            mat.roughness = 0.7;
            mat.reflectivity = 0.2;
        } else if(id < 2.5) {
            mat.albedo = vec3(0.6, 0.3, 0.1);
            mat.metallic = 0.0;
            mat.roughness = 0.8;
            mat.reflectivity = 0.1;
        } else if(id < 3.5) {
            mat.albedo = vec3(0.9, 0.9, 0.9);
            mat.metallic = 0.0;
            mat.roughness = 0.3;
            mat.reflectivity = 0.2;
        } else {
            mat.albedo = vec3(0.7, 0.7, 0.9);
            mat.metallic = 1.0;
            mat.roughness = 0.1;
            mat.reflectivity = 0.8;
        }
        return mat;
    }

    vec2 rayMarch(vec3 ro, vec3 rd) {
        float dO = 0.0;
        float lastId = -1.0;
        
        for(int i = 0; i < MAX_STEPS; i++) {
            vec3 p = ro + rd * dO;
            vec2 dS = sceneSDF(p);
            if(dS.x < SURF_DIST) return vec2(dO, dS.y);
            if(dO > MAX_DIST) break;
            dO += dS.x;
            lastId = dS.y;
        }
        return vec2(MAX_DIST, lastId);
    }

    vec3 calculateLighting(vec3 p, vec3 n, vec3 viewDir, Material mat) {
        vec3 lightPos1 = vec3(2.0, 4.0, -2.0);
        vec3 lightPos2 = vec3(-2.0, 3.0, 2.0);
        vec3 lightColor1 = vec3(1.0, 0.9, 0.8) * 1.5;
        vec3 lightColor2 = vec3(0.8, 0.9, 1.0) * 1.2;

        vec3 color = vec3(0.0);

        vec3 lightDir1 = normalize(lightPos1 - p);
        float shadow1 = softShadow(p, lightDir1, 0.1, length(lightPos1 - p), 16.0);
        float diff1 = max(dot(n, lightDir1), 0.0);
        vec3 h1 = normalize(lightDir1 + viewDir);
        float spec1 = pow(max(dot(n, h1), 0.0), 32.0);
        color += (mat.albedo * diff1 + spec1 * mat.reflectivity) * lightColor1 * shadow1;

        vec3 lightDir2 = normalize(lightPos2 - p);
        float shadow2 = softShadow(p, lightDir2, 0.1, length(lightPos2 - p), 16.0);
        float diff2 = max(dot(n, lightDir2), 0.0);
        vec3 h2 = normalize(lightDir2 + viewDir);
        float spec2 = pow(max(dot(n, h2), 0.0), 32.0);
        color += (mat.albedo * diff2 + spec2 * mat.reflectivity) * lightColor2 * shadow2;

        color += mat.albedo * 0.1;

        return color;
    }

    void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        uv.x *= resolution.x / resolution.y;

        float camDist = 5.0;
        vec3 ro = vec3(
            camDist * sin(iMouse.x * 2.0 * PI),
            2.0 + iMouse.y * 2.0,
            camDist * cos(iMouse.x * 2.0 * PI)
        );
        vec3 lookAt = vec3(0.0, 1.0, 0.0);
        
        vec3 forward = normalize(lookAt - ro);
        vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
        vec3 up = cross(forward, right);
        vec3 rd = normalize(forward + right * uv.x + up * uv.y);

        vec3 color = vec3(0.1);

        vec2 result = rayMarch(ro, rd);
        if(result.x < MAX_DIST) {
            vec3 p = ro + rd * result.x;
            vec3 normal = getNormal(p);
            Material mat = getMaterial(result.y);
            color = calculateLighting(p, normal, -rd, mat);

            if(mat.reflectivity > 0.0) {
                vec3 reflDir = reflect(rd, normal);
                vec2 reflResult = rayMarch(p + normal * 0.01, reflDir);
                if(reflResult.x < MAX_DIST) {
                    vec3 reflP = p + reflDir * reflResult.x;
                    vec3 reflNorm = getNormal(reflP);
                    Material reflMat = getMaterial(reflResult.y);
                    vec3 reflColor = calculateLighting(reflP, reflNorm, -reflDir, reflMat);
                    color = mix(color, reflColor, mat.reflectivity);
                }
            }
        }

        color = pow(color, vec3(0.4545));
        
        gl_FragColor = vec4(color, 1.0);
    }
  `;

  const uniforms = useMemo(() => ({
    resolution: { value: new THREE.Vector2(size.width, size.height) },
    iMouse: { value: new THREE.Vector3(0, 0, 0) },
    time: { value: 0 },
  }), [size]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.time.value = state.clock.elapsedTime;
      meshRef.current.material.uniforms.iMouse.value.set(
        state.mouse.x * 0.5 + 0.15,
        state.mouse.y * 0.5 + 0.15,
        0
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[10,10]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

const RayMarchingComponent = () => {
  return (
<div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
  <Canvas>
  {/* <OrbitControls   enablePan={false} enableZoom={true} enableRotate={false} rotation={[0,Math.PI,0]}/> */}
    <RayMarchingScene />
  </Canvas>
</div>
  );
};

export default RayMarchingComponent;