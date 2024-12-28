import { Canvas } from '@react-three/fiber';

import GradientMesh from '../hooks/GradientMesh';
import useDimension from '../hooks/useDimension';
import { OrthographicCamera } from '@react-three/drei';
import styles from "@/styles/scrollsection.module.css";

export default function Scene() {
  const device = useDimension();

  if (!device.width || !device.height) {
    return null;
  }

  const frustumSize = device.height;
  const aspect = device.width / device.height;

  return (
    <div className={styles.divv}>
      <Canvas>
        <OrthographicCamera
          makeDefault
          args={[
            (frustumSize * aspect) / -2,
            (frustumSize * aspect) / 2,
            frustumSize / 2,
            frustumSize / -2,
            -1000,
            1000,
          ]}
          position={[0, 0, 2]}
        />
        {/* <Model /> */}
        <GradientMesh />
      </Canvas>
    </div>
  );
}