import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useProgress, Html, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Simple fallback loader for initial loading
const SimpleFallback = () => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000
  }}>
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 20px 0' }}>
        Veranext
      </h1>
      <div style={{ fontSize: '16px', color: '#666' }}>Loading 3D...</div>
    </div>
  </div>
);

const ClientOnly = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 20px 0' }}>
            Veranext
          </h1>
          <div style={{ fontSize: '16px', color: '#666' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return children;
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Three.js Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 20px 0' }}>
              Veranext
            </h1>
            <div style={{ fontSize: '16px', color: '#666' }}>
              Loading 3D content...
              <br />
              <small style={{ fontSize: '12px', marginTop: '10px', display: 'block' }}>
                Please refresh if this takes too long
              </small>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Mobile detection with SSR safety
const isMobile = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth < 768;
};

// Reusable Configurator Content Component
const ConfiguratorContent = ({ 
  size, setSize, lightType, setLightType, lightsOn, setLightsOn,
  lightColor, setLightColor, roofType, setRoofType, 
  materialColor, setMaterialColor, mobile 
}) => {
  return (
    <div style={{ maxWidth: mobile ? '100%' : '300px' }}>
      <h2 style={{ 
        margin: '0 0 24px 0', 
        fontSize: mobile ? '20px' : '24px', 
        fontWeight: '600',
        color: '#1a1a1a',
        letterSpacing: '-0.02em'
      }}>
        Configure
      </h2>
      
      {/* Size Options */}
      <div style={{ marginBottom: mobile ? '20px' : '32px' }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          fontSize: mobile ? '14px' : '16px', 
          fontWeight: '500',
          color: '#333',
          letterSpacing: '-0.01em'
        }}>
          Dimensions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {['3x3', '4x4'].map((sizeOption) => (
            <button
              key={sizeOption}
              onClick={() => setSize(sizeOption)}
              style={{
                padding: mobile ? '10px 12px' : '12px 16px',
                border: size === sizeOption ? '2px solid #000' : '1px solid #d0d0d0',
                borderRadius: '8px',
                backgroundColor: size === sizeOption ? '#f8f8f8' : 'white',
                cursor: 'pointer',
                fontSize: mobile ? '12px' : '14px',
                fontWeight: '500',
                color: size === sizeOption ? '#000' : '#666',
                transition: 'all 0.2s ease',
                touchAction: 'manipulation'
              }}
            >
              {sizeOption}m
            </button>
          ))}
        </div>
      </div>

      {/* Light Type Options */}
      <div style={{ marginBottom: mobile ? '16px' : '24px' }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          fontSize: mobile ? '14px' : '16px', 
          fontWeight: '500',
          color: '#333'
        }}>
          Light Style
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
          {[
            { type: 'circle', icon: '●', label: 'Round' },
            { type: 'rect', icon: '▬', label: 'Linear' },
            { type: 'square', icon: '■', label: 'Square' }
          ].map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => setLightType(type)}
              style={{
                padding: mobile ? '8px 4px' : '12px 8px',
                border: lightType === type ? '2px solid #000' : '1px solid #d0d0d0',
                borderRadius: '8px',
                backgroundColor: lightType === type ? '#f8f8f8' : 'white',
                cursor: 'pointer',
                fontSize: mobile ? '14px' : '18px',
                color: lightType === type ? '#000' : '#666',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                touchAction: 'manipulation'
              }}
            >
              <span>{icon}</span>
              <span style={{ fontSize: mobile ? '9px' : '11px', fontWeight: '500' }}>{label}</span>
            </button>
          ))}
        </div>
        
        {/* Light Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center', 
          marginTop: '12px',
          padding: mobile ? '12px' : '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <button
            onClick={() => setLightsOn(!lightsOn)}
            style={{
              padding: mobile ? '6px 12px' : '8px 16px',
              border: '1px solid #d0d0d0',
              borderRadius: '6px',
              backgroundColor: lightsOn ? '#000' : 'white',
              color: lightsOn ? 'white' : '#666',
              cursor: 'pointer',
              fontSize: mobile ? '10px' : '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              touchAction: 'manipulation'
            }}
          >
            {lightsOn ? 'ON' : 'OFF'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
            <span style={{ fontSize: mobile ? '10px' : '12px', color: '#666' }}>Color</span>
            <input
              type="color"
              value={lightColor}
              onChange={(e) => setLightColor(e.target.value)}
              style={{
                width: mobile ? '24px' : '32px',
                height: mobile ? '24px' : '32px',
                border: '1px solid #d0d0d0',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      </div>

      {/* Roof Options */}
      <div style={{ marginBottom: mobile ? '20px' : '32px' }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          fontSize: mobile ? '14px' : '16px', 
          fontWeight: '500',
          color: '#333'
        }}>
          Roof Style
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: mobile ? '8px' : '12px' }}>
          {[
            { type: 'roof1', image: '/roof1.jpg', label: 'Flat' },
            { type: 'roof2', image: '/roof2.jpg', label: 'Pitched' }
          ].map(({ type, image, label }) => (
            <button
              key={type}
              onClick={() => setRoofType(type)}
              style={{
                padding: '0',
                border: roofType === type ? '3px solid #000' : '1px solid #d0d0d0',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                touchAction: 'manipulation'
              }}
            >
              <div style={{
                width: '100%',
                height: mobile ? '50px' : '80px',
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#f0f0f0'
              }} />
              <div style={{
                padding: mobile ? '6px' : '8px',
                fontSize: mobile ? '10px' : '12px',
                fontWeight: '500',
                color: roofType === type ? '#000' : '#666'
              }}>
                {label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Material Color Options */}
      <div style={{ marginBottom: mobile ? '16px' : '32px' }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          fontSize: mobile ? '14px' : '16px', 
          fontWeight: '500',
          color: '#333'
        }}>
          Frame Color
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: mobile ? '8px' : '12px' }}>
          {[
            { color: 'anthracite', hex: '#28282d', label: 'Anthracite' },
            { color: 'white', hex: '#f5f5f5', label: 'White' }
          ].map(({ color, hex, label }) => (
            <button
              key={color}
              onClick={() => setMaterialColor(color)}
              style={{
                padding: mobile ? '12px 8px' : '16px 12px',
                border: materialColor === color ? '3px solid #000' : '1px solid #d0d0d0',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: mobile ? '8px' : '12px',
                transition: 'all 0.2s ease',
                touchAction: 'manipulation'
              }}
            >
              <div style={{
                width: mobile ? '16px' : '24px',
                height: mobile ? '16px' : '24px',
                backgroundColor: hex,
                borderRadius: '50%',
                border: '1px solid #ddd'
              }} />
              <span style={{
                fontSize: mobile ? '12px' : '14px',
                fontWeight: '500',
                color: materialColor === color ? '#000' : '#666'
              }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Loading component with proper hook usage
const Loader = () => {
  const { progress } = useProgress();
  
  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <h1 style={{
          margin: '0 0 20px 0',
          fontSize: '32px',
          fontWeight: '700',
          color: '#1a1a1a',
          letterSpacing: '-0.02em'
        }}>
          Veranext
        </h1>
        <div style={{
          width: '200px',
          height: '4px',
          backgroundColor: '#e0e0e0',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '12px'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#000',
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <p style={{
          margin: '0',
          fontSize: '14px',
          color: '#666',
          textAlign: 'center'
        }}>
          Loading {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
};

const VerandaConfigurator = () => {
  const [size, setSize] = useState('3x3');
  const [lightType, setLightType] = useState('circle');
  const [lightsOn, setLightsOn] = useState(false); // Default off for better performance
  const [lightColor, setLightColor] = useState('#ffd700');
  const [roofType, setRoofType] = useState('roof1');
  const [materialColor, setMaterialColor] = useState('anthracite');
  const [configOpen, setConfigOpen] = useState(false);
  const [mobile, setMobile] = useState(false);

  // Safe mobile detection after component mounts
  useEffect(() => {
    setMobile(isMobile());
    
    const handleResize = () => {
      setMobile(isMobile());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pixelRatio = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2) : 1;

  // Mobile-responsive layout
  const canvasWidth = mobile ? '100%' : '65%';
  const configWidth = mobile ? '100%' : '35%';
  const flexDirection = mobile ? 'column' : 'row';

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex',
      flexDirection: flexDirection,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Canvas Section */}
      <div style={{ 
        width: canvasWidth, 
        height: mobile ? '100vh' : '100vh',
        position: 'relative'
      }}>
        <Suspense fallback={<SimpleFallback />}>
          <Canvas 
            shadows={!mobile}
            camera={{ 
              position: [0, -1, -4.3], 
              fov: mobile ? 70 : 85 
            }}
            dpr={pixelRatio}
            performance={{
              min: mobile ? 0.2 : 0.5,
              max: mobile ? 0.8 : 1,
              debounce: mobile ? 200 : 100
            }}
            gl={{
              powerPreference: mobile ? 'low-power' : 'high-performance',
              antialias: true,
              alpha: false,
              stencil: false,
              depth: true
            }}
            style={{ 
              background: 'linear-gradient(180deg, #87CEEB 0%, #98FB98 100%)',
              backgroundImage: 'url("/bg.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center bottom',
              touchAction: 'none'
            }}
            onCreated={(state) => {
              state.gl.setClearColor('#000000ff', 1);
            }}
          >
            <Suspense fallback={<Loader />}>
              <VerandaModel 
                size={size}
                lightType={lightType}
                lightsOn={lightsOn}
                lightColor={lightColor}
                roofType={roofType}
                materialColor={materialColor}
                mobile={mobile}
              />
              <Environment preset='city'/>
              <OrbitControls 
                enablePan={!mobile}
                enableZoom={true}
                enableRotate={true}
  
                maxPolarAngle={Math.PI / 2.2}
                target={[0, 0, 0]}
        
                enableDamping={true}
                dampingFactor={0.05}
                touches={THREE ? {
                  ONE: THREE.TOUCH.ROTATE,
                  TWO: THREE.TOUCH.DOLLY_PAN
                } : undefined}
              />
            </Suspense>
          </Canvas>
        </Suspense>

        {/* Mobile Configure Button */}
        {mobile && (
          <button
            onClick={() => setConfigOpen(true)}
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '16px 32px',
              backgroundColor: '#000',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              zIndex: 1000,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              touchAction: 'manipulation'
            }}
          >
            ⚙️ Configure
          </button>
        )}
      </div>

      {/* Desktop Configurator Section */}
      {!mobile && (
        <div style={{
          width: configWidth,
          height: '100vh',
          backgroundColor: '#fafafa',
          borderLeft: '1px solid #e0e0e0',
          overflowY: 'auto',
          padding: '32px 24px'
        }}>
          <ConfiguratorContent 
            {...{
              size, setSize, lightType, setLightType, lightsOn, setLightsOn,
              lightColor, setLightColor, roofType, setRoofType, 
              materialColor, setMaterialColor, mobile
            }}
          />
        </div>
      )}

      {/* Mobile Dropdown Configurator */}
      {mobile && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              opacity: configOpen ? 1 : 0,
              visibility: configOpen ? 'visible' : 'hidden',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 1001,
              backdropFilter: configOpen ? 'blur(4px)' : 'blur(0px)'
            }}
            onClick={() => setConfigOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#fafafa',
              borderRadius: '20px 20px 0 0',
              maxHeight: '80vh',
              transform: configOpen ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 1002,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Handle Bar */}
            <div style={{
              width: '40px',
              height: '4px',
              backgroundColor: '#ccc',
              borderRadius: '2px',
              margin: '12px auto 0',
              opacity: 0.6
            }} />
            
            {/* Close Button */}
            <button
              onClick={() => setConfigOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: '#666',
                transition: 'all 0.2s ease',
                touchAction: 'manipulation',
                zIndex: 1003
              }}
            >
              ✕
            </button>

            <div style={{ padding: '20px 20px 40px' }}>
              <ConfiguratorContent 
                {...{
                  size, setSize, lightType, setLightType, lightsOn, setLightsOn,
                  lightColor, setLightColor, roofType, setRoofType, 
                  materialColor, setMaterialColor, mobile
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const VerandaModel = ({ size, lightType, lightsOn, lightColor, roofType, materialColor, mobile }) => {
  const { scene } = useGLTF('/veranda.glb');
  const groupRef = useRef();

  // Optimize lighting with useMemo to prevent recreating lights on every render
  const optimizedLights = useMemo(() => {
    if (!lightsOn || !scene) return [];

    // Collect all light positions for the current light type
    const lightPositions = [];

    scene.traverse((child) => {
      const isCurrentLightType = 
        (child.name.match(/^Circle(\.?\d+)?$/) && lightType === 'circle') ||
        (child.name.match(/^Rect(\.?\d+)?$/) && lightType === 'rect') ||
        (child.name.match(/^Square(\.?\d+)?$/) && lightType === 'square');

      if (isCurrentLightType) {
        const worldPosition = new THREE.Vector3();
        child.getWorldPosition(worldPosition);
        lightPositions.push(worldPosition);
      }
    });

    // Create lights without shadows for better performance
    return lightPositions.map((position, index) => (
      <pointLight
        key={`light-${lightType}-${index}-${size}-${lightColor}`}
        position={[position.x, position.y - 0.1, position.z]}
        intensity={mobile ? 0.5 : 0.6}
        color={lightColor}
        distance={mobile ? 12 : 15}
        decay={2}
        castShadow={false} // No shadows for performance
      />
    ));
  }, [lightsOn, lightType, lightColor, scene, mobile, size]);

  // Memoize the cloned scene and materials to prevent recreation
  const { clonedScene, material } = useMemo(() => {
    if (!scene) return { clonedScene: null, material: null };

    const clonedScene = scene.clone();

    // Create a single material that we'll update
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: materialColor === 'anthracite' ? '#28282d' : '#f5f5f5',
      metalness: mobile ? 0.3 : 0.5,
      roughness: mobile ? 0.7 : 0.5
    });

    return {
      clonedScene,
      material: frameMaterial
    };
  }, [scene, mobile, materialColor]);

  useEffect(() => {
    if (!clonedScene || !material) return;

    // Update scene properties
    clonedScene.traverse((child) => {
      // Handle roof visibility
      if (child.name === 'triangleroof') {
        child.visible = roofType === 'roof2';
      }
      if (child.name === 'planeroof') {
        child.visible = roofType === 'roof1';
      }

      // Handle light visibility based on type
      if (child.name.match(/^Circle(\.?\d+)?$/)) {
        child.visible = lightType === 'circle';
      }
      if (child.name.match(/^Rect(\.?\d+)?$/)) {
        child.visible = lightType === 'rect';
      }
      if (child.name.match(/^Square(\.?\d+)?$/)) {
        child.visible = lightType === 'square';
      }

      // Update materials - assign the single material with correct color
      if (child.material && child.material.name === 'Material.001') {
        child.material = material;
      }

      // Disable shadows for better performance
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });

    // Handle scaling for size
    if (groupRef.current) {
      const scale = size === '4x4' ? 1.33 : 1;
      groupRef.current.scale.set(scale, scale, scale);
    }

  }, [clonedScene, material, size, lightType, roofType, materialColor, mobile]);

  if (!clonedScene || !material) {
    return null;
  }

  return (
    <group ref={groupRef} position={[0,-1.2,0]}>
      <primitive object={clonedScene}  />
      {optimizedLights}
    </group>
  );
};

// Preload the GLTF safely
if (typeof window !== 'undefined') {
  try {
    useGLTF.preload('/veranda.glb');
  } catch (error) {
    console.warn('Failed to preload GLTF:', error);
  }
}

// Main export wrapped with ClientOnly and ErrorBoundary
const VerandaConfiguratorApp = () => {
  return (
    <ErrorBoundary>
      <ClientOnly>
        <VerandaConfigurator />
      </ClientOnly>
    </ErrorBoundary>
  );
};

export default VerandaConfiguratorApp;