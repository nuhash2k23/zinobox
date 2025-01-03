import { Canvas } from '@react-three/fiber';

import GradientMesh from '../hooks/GradientMesh';
import useDimension from '../hooks/useDimension';
import { OrthographicCamera } from '@react-three/drei';
import styles from "@/styles/scrollsection.module.css";
import VideoBackground from './VideoBackground';

export default function Scene() {
  const device = useDimension();

  if (!device.width || !device.height) {
    return null;
  }

  const aspect = device.width / device.height;
  const frustumSize = 2;

  return (
    <div className={styles.divv}>
     <Canvas
        gl={{ antialias: true }}
     
      >
      <OrthographicCamera
          makeDefault
          args={[
            -frustumSize * aspect / 2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            -frustumSize / 2,
            -1000,
            1000
          ]}
          position={[0, 0, 2]}
        />
        <GradientMesh/>
        {/* <Model /> */}
        {/* <VideoBackground /> */}
      </Canvas>
    </div>
  );
}