<group position={[6.612, 4.226, 0]} rotation={[-Math.PI / 2, 0.005, -3.132]}>
<mesh
  castShadow
  receiveShadow
  geometry={nodes.Object_2.geometry}
  material={materials.Bridge_Trim}
/>
<mesh
  castShadow
  receiveShadow
  geometry={nodes.Object_2_1.geometry}
  material={materials.Concrete}
/>
<mesh
  castShadow
  receiveShadow
  geometry={nodes.Object_2_2.geometry}
  material={materials.Bridge_Stone}
/>
</group>
<group position={[6.612, 4.226, 0]} rotation={[-Math.PI / 2, 0.005, -3.132]}>
<mesh
  castShadow
  receiveShadow
  geometry={nodes.Object_5.geometry}
  material={materials.lotta_walls}
/>
<mesh
  castShadow
  receiveShadow
  geometry={nodes.Object_5_1.geometry}
  material={materials.highway_railing_trim_transparent}
/>
<mesh
  castShadow
  receiveShadow
  geometry={nodes.Object_5_2.geometry}
  material={materials.Bricks}
/>
<mesh
  castShadow
  receiveShadow
  geometry={nodes.Object_5_3.geometry}
  material={materials.High_Bridge}
/>
</group>
<mesh
castShadow
receiveShadow
geometry={nodes.road.geometry}
material={materials.Wood_Plank}
position={[6.612, 4.226, 0]}
rotation={[-Math.PI / 2, 0.005, -3.132]}
/>

material={fenceMaterialRef.current || materials.High_Bridge}
material={pillarMaterialRef.current || materials.lotta_walls}
material={roadMaterialRef.current || materials.Wood_Plank}