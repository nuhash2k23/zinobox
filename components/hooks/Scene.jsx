import { Canvas } from '@react-three/fiber';
import useDimension from '../hooks/useDimension';
import { OrthographicCamera } from '@react-three/drei';
import VideoBackground from './VideoBackground';

export default function Scene() {
  const device = useDimension();

  if (!device.width || !device.height) {
    return null;
  }

  const aspect = device.width / device.height;
  const frustumSize = 2;

  return (
    <div className='divv'> 

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

        <VideoBackground />
      </Canvas>
    </div>
  );
}