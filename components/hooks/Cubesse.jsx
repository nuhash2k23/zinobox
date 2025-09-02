import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useProgress, Html, Environment, Stage } from '@react-three/drei';
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
        Cubesse
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
            Cubesse
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
              Cubesse
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

// Recording Modal Component
const RecordingModal = ({ isOpen, onClose, status }) => {
  if (!isOpen) return null;

  return (
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
          zIndex: 10000,
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          minWidth: '300px',
          maxWidth: '90vw',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          zIndex: 10001,
          textAlign: 'center'
        }}
      >
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#ff4444',
          borderRadius: '50%',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          animation: 'pulse 2s infinite'
        }}>
          🎤
        </div>
        
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#1a1a1a'
        }}>
          Voice Recording
        </h3>
        
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '14px',
          color: '#666',
          lineHeight: '1.5'
        }}>
          {status || 'Speak your veranda dimensions or color preference. For example: "8 meters by 8 meters" or "white color"'}
        </p>
        
        <button
          onClick={onClose}
          style={{
            padding: '12px 24px',
            backgroundColor: '#000',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Stop Recording
        </button>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
};

// Reusable Configurator Content Component
const ConfiguratorContent = ({ 
  size, setSize, lightType, setLightType, lightsOn, setLightsOn,
  lightColor, setLightColor, roofType, setRoofType, 
  materialColor, setMaterialColor, mobile,
  dimensionInput, setDimensionInput, isListening, toggleVoiceInput, 
  speechSupported, parseDimensions, parseStatus,
  timeOfDay, setTimeOfDay, multiplier, setMultiplier
}) => {

  return (
    <div style={{ 
      maxWidth: mobile ? '100%' : '300px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {!mobile && (
        <h2 style={{ 
          margin: '0 0 32px 0', 
          fontSize: '28px', 
          fontWeight: '700',
          color: '#1a1a1a',
          letterSpacing: '-0.03em'
        }}>
          Configure
        </h2>
      )}
      
      {/* Size Options - Now with AI parsing */}
      <div style={{ marginBottom: mobile ? '24px' : '32px' }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: mobile ? '16px' : '18px', 
          fontWeight: '600',
          color: '#1a1a1a',
          letterSpacing: '-0.02em'
        }}>
          Dimensions
        </h3>
        
        {/* Current dimensions display */}
        <div style={{
          padding: mobile ? '8px 12px' : '12px 16px',
          backgroundColor: '#f8f8f8',
          borderRadius: '8px',
          marginBottom: '12px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: mobile ? '14px' : '16px', fontWeight: '600', color: '#000' }}>
            {size.width}m × {size.height}m
          </div>
          <div style={{ fontSize: mobile ? '10px' : '12px', color: '#666' }}>
            Current dimensions
          </div>
        </div>

        {/* Text input for dimensions */}
        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="e.g., 5 by 6 meters, 4x3m, white color, anthracite frame"
            value={dimensionInput}
            onChange={(e) => {
              setDimensionInput(e.target.value);
              parseDimensions(e.target.value);
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#000';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d0d0d0';
            }}
            style={{
              width: '100%',
              padding: mobile ? '10px 12px' : '12px 16px',
              border: '1px solid #d0d0d0',
              borderRadius: '8px',
              fontSize: mobile ? '12px' : '14px',
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Voice input button */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={toggleVoiceInput}
            disabled={!speechSupported}
            style={{
              flex: '1',
              padding: mobile ? '10px 12px' : '12px 16px',
              border: isListening ? '2px solid #ff4444' : '1px solid #d0d0d0',
              borderRadius: '8px',
              backgroundColor: isListening ? '#fff5f5' : (speechSupported ? 'white' : '#f5f5f5'),
              cursor: speechSupported ? 'pointer' : 'not-allowed',
              fontSize: mobile ? '12px' : '14px',
              fontWeight: '500',
              color: isListening ? '#ff4444' : (speechSupported ? '#333' : '#999'),
              transition: 'all 0.2s ease',
              touchAction: 'manipulation',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>{isListening ? '🛑' : '🎤'}</span>
            {isListening ? 'Recording... (Click to Stop)' : (speechSupported ? 'Voice Input' : 'Voice Disabled')}
          </button>
        </div>
        
        {/* Browser check info */}
        {!speechSupported && (
          <div style={{
            marginTop: '8px',
            padding: '6px 8px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            fontSize: mobile ? '10px' : '11px',
            color: '#856404'
          }}>
            💡 Voice input requires microphone access - allow permissions when prompted
          </div>
        )}
        
        {/* Status message */}
        {parseStatus && (
          <div style={{
            marginTop: '8px',
            padding: '6px 8px',
            backgroundColor: parseStatus.type === 'success' ? '#f0f9ff' : '#fef2f2',
            border: `1px solid ${parseStatus.type === 'success' ? '#bae6fd' : '#fecaca'}`,
            borderRadius: '4px',
            fontSize: mobile ? '10px' : '11px',
            color: parseStatus.type === 'success' ? '#0369a1' : '#dc2626'
          }}>
            {parseStatus.message}
          </div>
        )}
      </div>

      {/* Multiplier Options */}
      <div style={{ marginBottom: mobile ? '24px' : '32px' }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: mobile ? '16px' : '18px', 
          fontWeight: '600',
          color: '#1a1a1a',
          letterSpacing: '-0.02em'
        }}>
          Layout
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: mobile ? '8px' : '12px' }}>
          {[
            { type: 1, icon: '1️⃣', label: 'Single' },
            { type: 2, icon: '2️⃣', label: '2x Side' },
            { type: 3, icon: '3️⃣', label: '3x Side' }
          ].map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => setMultiplier(type)}
              style={{
                padding: mobile ? '12px 8px' : '16px 12px',
                border: multiplier === type ? '3px solid #000' : '1px solid #d0d0d0',
                borderRadius: '8px',
                backgroundColor: multiplier === type ? '#f8f8f8' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: mobile ? '6px' : '8px',
                touchAction: 'manipulation',
                flexDirection: 'column'
              }}
            >
              <span style={{ fontSize: mobile ? '16px' : '20px' }}>{icon}</span>
              <span style={{
                fontSize: mobile ? '10px' : '12px',
                fontWeight: '500',
                color: multiplier === type ? '#000' : '#666'
              }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Time of Day Options */}
      <div style={{ marginBottom: mobile ? '24px' : '32px' }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: mobile ? '16px' : '18px', 
          fontWeight: '600',
          color: '#1a1a1a',
          letterSpacing: '-0.02em'
        }}>
          Time of Day
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: mobile ? '8px' : '12px' }}>
          {[
            { type: 'day', icon: '☀️', label: 'Day' },
            { type: 'night', icon: '🌙', label: 'Night' }
          ].map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => setTimeOfDay(type)}
              style={{
                padding: mobile ? '12px 8px' : '16px 12px',
                border: timeOfDay === type ? '3px solid #000' : '1px solid #d0d0d0',
                borderRadius: '8px',
                backgroundColor: timeOfDay === type ? '#f8f8f8' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: mobile ? '6px' : '8px',
                touchAction: 'manipulation'
              }}
            >
              <span style={{ fontSize: mobile ? '16px' : '20px' }}>{icon}</span>
              <span style={{
                fontSize: mobile ? '12px' : '14px',
                fontWeight: '500',
                color: timeOfDay === type ? '#000' : '#666'
              }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Light Type Options */}
      <div style={{ marginBottom: mobile ? '20px' : '24px' }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: mobile ? '16px' : '18px', 
          fontWeight: '600',
          color: '#1a1a1a',
          letterSpacing: '-0.02em'
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
      <div style={{ marginBottom: mobile ? '24px' : '32px' }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: mobile ? '16px' : '18px', 
          fontWeight: '600',
          color: '#1a1a1a',
          letterSpacing: '-0.02em'
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

      {/* Frame Color Options */}
      <div style={{ marginBottom: mobile ? '20px' : '32px' }}>
        <h3 style={{ 
          margin: '0 0 16px 0', 
          fontSize: mobile ? '16px' : '18px', 
          fontWeight: '600',
          color: '#1a1a1a',
          letterSpacing: '-0.02em'
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
          Cubesse
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

// Camera Controller for smooth zooming
const CameraController = ({ multiplier, mobile }) => {
  const { camera } = useThree();
  const controlsRef = useRef();

  // Smooth camera adjustment when multiplier changes
  useEffect(() => {
    if (!controlsRef.current) return;

    let targetPosition, cameraPosition, maxDistance;

    switch (multiplier) {
      case 1:
        targetPosition = [0, 0, 0];
        cameraPosition = [2, 1.5, 8];
        maxDistance = 20;
        break;
      case 2:
        targetPosition = [1, 0, 0];
        cameraPosition = [3, 2, 12];
        maxDistance = 25;
        break;
      case 3:
        targetPosition = [0, 0, 0];
        cameraPosition = [4, 2.5, 16];
        maxDistance = 30;
        break;
      default:
        targetPosition = [0, 0, 0];
        cameraPosition = [2, 1.5, 8];
        maxDistance = 20;
    }

    // Smooth transition to new camera position
    const startPosition = camera.position.clone();
    const endPosition = new THREE.Vector3(...cameraPosition);
    const startTarget = controlsRef.current.target.clone();
    const endTarget = new THREE.Vector3(...targetPosition);
    
    let progress = 0;
    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing function
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // Interpolate camera position
      camera.position.lerpVectors(startPosition, endPosition, easeProgress);
      
      // Interpolate target
      controlsRef.current.target.lerpVectors(startTarget, endTarget, easeProgress);
      
      // Update max distance
      controlsRef.current.maxDistance = maxDistance;
      
      controlsRef.current.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [multiplier, camera]);

  return (
    <OrbitControls 
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minPolarAngle={0}
      maxDistance={20} // Will be updated by useEffect
      target={[0, 0, 0]}
      enableDamping={true}
      dampingFactor={0.05}
      touches={THREE ? {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      } : undefined}
    />
  );
};

const VerandaConfigurator = () => {
  const [size, setSize] = useState({ width: 3, height: 3 });
  const [lightType, setLightType] = useState('circle');
  const [lightsOn, setLightsOn] = useState(false);
  const [lightColor, setLightColor] = useState('#ffd700');
  const [roofType, setRoofType] = useState('roof1');
  const [materialColor, setMaterialColor] = useState('anthracite');
  const [mobile, setMobile] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [multiplier, setMultiplier] = useState(1);
  
  // Mobile configuration panel state
  const [showMobileConfig, setShowMobileConfig] = useState(false);

  // States for AI dimension parsing and recording
  const [dimensionInput, setDimensionInput] = useState('3m by 3m');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [parseStatus, setParseStatus] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  // Dimension and color parsing function with enhanced patterns
  const parseDimensions = (text) => {
    if (!text.trim()) {
      setParseStatus(null);
      return;
    }

    // Normalize the text for better matching
    const normalizedText = text.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/eight/g, '8')
      .replace(/five/g, '5')
      .replace(/six/g, '6')
      .replace(/seven/g, '7')
      .replace(/nine/g, '9')
      .replace(/ten/g, '10')
      .replace(/three/g, '3')
      .replace(/four/g, '4')
      .replace(/two/g, '2')
      .replace(/one/g, '1')
      .replace(/zero/g, '0')
      .trim();

    console.log('Normalized text:', normalizedText);

    // Clear any existing status after a delay
    setTimeout(() => setParseStatus(null), 4000);

    // Check for color commands first
    const colorPatterns = [
      { pattern: /\b(white|wite)\b/i, color: 'white', label: 'White' },
      { pattern: /\b(anthracite|anthrasit|gray|grey|dark|black)\b/i, color: 'anthracite', label: 'Anthracite' }
    ];

    for (const { pattern, color, label } of colorPatterns) {
      if (pattern.test(normalizedText)) {
        setMaterialColor(color);
        setParseStatus({
          type: 'success',
          message: `✓ Changed frame color to ${label}`
        });
        return;
      }
    }

    // Enhanced regex patterns to catch different formats for dimensions
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(?:m|meter|meters)\s*(?:by|x|×|and)\s*(\d+(?:\.\d+)?)\s*(?:m|meter|meters)/i,
      /(\d+(?:\.\d+)?)\s*(?:by|x|×|and)\s*(\d+(?:\.\d+)?)\s*(?:m|meter|meters)?/i,
      /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i,
      /(?:veranda|structure|size|dimension).*?(\d+(?:\.\d+)?)\s*(?:m|meter|meters)?\s*(?:by|x|×|and)\s*(\d+(?:\.\d+)?)\s*(?:m|meter|meters)?/i,
      /(\d+(?:\.\d+)?)\s*(?:and|to|by)\s*(\d+(?:\.\d+)?)\s*(?:m|meter|meters)/i,
      /(\d+(?:\.\d+)?)\s+(?:to|and|by|\s)\s*(\d+(?:\.\d+)?)/i
    ];

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = normalizedText.match(pattern);
      console.log(`Pattern ${i + 1}:`, pattern, 'Match:', match);
      
      if (match) {
        const width = parseFloat(match[1]);
        const height = parseFloat(match[2]);
        
        console.log('Parsed dimensions:', width, 'x', height);
        
        if (width >= 2 && width <= 20 && height >= 2 && height <= 20) {
          setSize({ width, height });
          setParseStatus({
            type: 'success',
            message: `✓ Set dimensions to ${width}m × ${height}m`
          });
          return;
        } else {
          setParseStatus({
            type: 'error',
            message: '⚠ Dimensions must be between 2m and 20m'
          });
          return;
        }
      }
    }

    setParseStatus({
      type: 'error',
      message: `❌ Could not parse "${text}". Try "8 by 8 meters" or "white color"`
    });
  };

  // Recording functionality
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Setting up speech recognition...');
      
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          setSpeechSupported(true);
          console.log('Microphone access available');
        })
        .catch((error) => {
          console.error('Microphone access denied:', error);
          setParseStatus({
            type: 'error',
            message: '🎤 Microphone access required. Please allow microphone permissions.'
          });
        });
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setParseStatus({ type: 'info', message: '⏳ Processing audio...' });
        
        setTimeout(() => {
          setParseStatus({
            type: 'info',
            message: 'Voice recording feature coming soon!'
          });
        }, 2000);
        
        setAudioChunks([]);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsListening(true);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setParseStatus({
        type: 'error',
        message: '❌ Could not start recording. Check microphone permissions.'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsListening(false);
    }
  };

  const toggleVoiceInput = () => {
    if (!speechSupported) {
      setParseStatus({
        type: 'error',
        message: '❌ Microphone not available'
      });
      return;
    }

    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

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

  // Mobile-responsive layout - Mobile: full canvas with overlay config, Desktop: side by side
  const canvasWidth = mobile ? '100%' : '70%';
  const configWidth = mobile ? '100%' : '30%';
  const canvasHeight = mobile ? '100vh' : '100vh';
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
      {/* Recording Modal */}
      <RecordingModal 
        isOpen={isListening} 
        onClose={() => setIsListening(false)}
        status={parseStatus?.message}
      />

      {/* Canvas Section */}
      <div style={{ 
        width: canvasWidth, 
        height: canvasHeight,
        position: 'relative'
      }}>
        <Suspense fallback={<SimpleFallback />}>
          <Canvas 
            shadows={true}
            camera={{ 
              position: [2, 1.5, 8],
              fov: mobile ? 85 : 65
            }}
            dpr={pixelRatio}
            performance={{
              min: mobile ? 0.5 : 0.5,
              max: mobile ? 1 : 1,
              debounce: mobile ? 50 : 50
            }}
            gl={{
              powerPreference: mobile ? 'default' : 'high-performance',
              antialias: true,
              alpha: true,
              stencil: false,
              depth: true
            }}
            style={{ 
              touchAction: 'none'
            }}
          >
            <Suspense fallback={<Loader />}>
              <Stage
              adjustCamera={false}
                intensity={timeOfDay === 'night' ? 0.3 : 1}
                environment={timeOfDay === 'night' ? "night" : "city"}
                shadows={{ 
                  type: 'contact', 
                  opacity: timeOfDay === 'night' ? 0.2 : 0.4, 
                  blur: 3 
                }}
              >
                <VerandaModel 
                  size={size}
                  lightType={lightType}
                  lightsOn={lightsOn}
                  lightColor={lightColor}
                  roofType={roofType}
                  materialColor={materialColor}
                  mobile={mobile}
                  timeOfDay={timeOfDay}
                  multiplier={multiplier}
                />
              </Stage>
              
              <CameraController multiplier={multiplier} mobile={mobile} />
            </Suspense>
          </Canvas>
        </Suspense>

        {/* Mobile Configure Button - Floating bottom */}
        {mobile && (
          <button
            onClick={() => setShowMobileConfig(true)}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              width: '60px',
              height: '60px',
              backgroundColor: '#000',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              fontSize: '24px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              touchAction: 'manipulation'
            }}
            onTouchStart={(e) => {
              e.target.style.transform = 'scale(0.95)';
            }}
            onTouchEnd={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            ⚙️
          </button>
        )}
      </div>

      {/* Mobile Configuration Panel Overlay */}
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
              zIndex: 9999,
              backdropFilter: 'blur(4px)',
              opacity: showMobileConfig ? 1 : 0,
              visibility: showMobileConfig ? 'visible' : 'hidden',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setShowMobileConfig(false)}
          />
          
          {/* Sliding Configuration Panel */}
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#fafafa',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              maxHeight: '85vh',
              overflowY: 'auto',
              zIndex: 10000,
              transform: showMobileConfig ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Handle Bar */}
            <div
              style={{
                width: '48px',
                height: '4px',
                backgroundColor: '#d0d0d0',
                borderRadius: '2px',
                margin: '12px auto 0',
                cursor: 'pointer'
              }}
              onClick={() => setShowMobileConfig(false)}
            />
            
            {/* Close Button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px 0'
              }}
            >
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: '#1a1a1a',
                letterSpacing: '-0.03em'
              }}>
                Configure
              </h2>
              <button
                onClick={() => setShowMobileConfig(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s ease'
                }}
                onTouchStart={(e) => {
                  e.target.style.backgroundColor = '#f0f0f0';
                }}
                onTouchEnd={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                ✕
              </button>
            </div>
            
            {/* Configuration Content */}
            <div style={{ padding: '0 20px 40px' }}>
              <ConfiguratorContent 
                {...{
                  size, setSize, lightType, setLightType, lightsOn, setLightsOn,
                  lightColor, setLightColor, roofType, setRoofType, 
                  materialColor, setMaterialColor, mobile,
                  dimensionInput, setDimensionInput, isListening, toggleVoiceInput,
                  speechSupported, parseDimensions, parseStatus,
                  timeOfDay, setTimeOfDay, multiplier, setMultiplier
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Desktop Configurator Section - Only visible on desktop */}
      {!mobile && (
        <div style={{
          width: configWidth,
          height: '100vh',
          backgroundColor: '#fafafa',
          borderLeft: '1px solid #e0e0e0',
          overflowY: 'auto',
          padding: '32px 24px',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <ConfiguratorContent 
            {...{
              size, setSize, lightType, setLightType, lightsOn, setLightsOn,
              lightColor, setLightColor, roofType, setRoofType, 
              materialColor, setMaterialColor, mobile,
              dimensionInput, setDimensionInput, isListening, toggleVoiceInput,
              speechSupported, parseDimensions, parseStatus,
              timeOfDay, setTimeOfDay, multiplier, setMultiplier
            }}
          />
        </div>
      )}
    </div>
  );
};

const VerandaModel = ({ 
  size, lightType, lightsOn, lightColor, roofType, materialColor, mobile, 
  timeOfDay, multiplier
}) => {
  const { scene } = useGLTF('/h/veranda.glb');
  const groupRef = useRef();

  // Memoize the cloned scene and materials to prevent recreation
  const { clonedScene, frameMaterial, lightMaterial } = useMemo(() => {
    if (!scene) return { clonedScene: null, frameMaterial: null, lightMaterial: null };

    const clonedScene = scene.clone();

    // Create frame material with proper color for structural elements
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: materialColor === 'anthracite' ? '#28282d' : '#f5f5f5',
      metalness: 0.8,
      roughness: 0.2
    });

    // Create glowing light material with enhanced bloom effect - opposite to frame color
    const lightObjectColor = materialColor === 'anthracite' ? '#f5f5f5' : '#28282d';
    const lightMaterial = new THREE.MeshStandardMaterial({
      color: lightsOn ? lightObjectColor : '#333333',
      emissive: lightsOn ? lightColor : '#000000',
      emissiveIntensity: lightsOn ? (timeOfDay === 'night' ? 1.5 : 1.0) : 0,
      transparent: true,
      opacity: lightsOn ? 1 : 0.3
    });

    return {
      clonedScene,
      frameMaterial,
      lightMaterial
    };
  }, [scene, materialColor, lightsOn, lightColor, timeOfDay]);

  useEffect(() => {
    if (!clonedScene || !frameMaterial || !lightMaterial) return;

    // Update scene properties
    clonedScene.traverse((child) => {
      // Handle roof visibility
      if (child.name === 'triangleroof') {
        child.visible = roofType === 'roof2';
      }
      if (child.name === 'planeroof') {
        child.visible = roofType === 'roof1';
      }

      // Handle light visibility and apply glowing material
      const isCircleLight = child.name.match(/^Circle(\.?\d+)?$/);
      const isRectLight = child.name.match(/^Rect(\.?\d+)?$/);
      const isSquareLight = child.name.match(/^Square(\.?\d+)?$/);
      const isRodLight = child.name === 'rodlight' || child.name === 'rodlighttwo';

      if (isCircleLight) {
        child.visible = lightType === 'circle';
        if (child.material && lightType === 'circle') {
          child.material = lightMaterial.clone();
        }
      }
      if (isRectLight) {
        child.visible = lightType === 'rect';
        if (child.material && lightType === 'rect') {
          child.material = lightMaterial.clone();
        }
      }
      if (isSquareLight) {
        child.visible = lightType === 'square';
        if (child.material && lightType === 'square') {
          child.material = lightMaterial.clone();
        }
      }
      if (isRodLight) {
        child.visible = lightsOn;
        if (child.material) {
          child.material = lightMaterial.clone();
        }
      }

      // Update frame materials
      if (child.material && child.material.name === 'Material.001') {
        child.material = frameMaterial;
      }

      // Configure shadows for meshes
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Handle scaling for size
    if (groupRef.current) {
      const baseSize = 3;
      const scaleMultiplier = 0.11;
      
      const scaleX = 1 + ((size.width - baseSize) / baseSize) * scaleMultiplier;
      const scaleZ = 1 + ((size.height - baseSize) / baseSize) * scaleMultiplier;
      const scaleY = 1 + (((scaleX - 1) + (scaleZ - 1)) / 40);
      
      groupRef.current.scale.set(scaleX, scaleY, scaleZ);
    }

  }, [clonedScene, frameMaterial, lightMaterial, size.width, size.height, lightType, roofType, lightsOn, lightColor, timeOfDay]);

  if (!clonedScene || !frameMaterial || !lightMaterial) {
    return null;
  }

  // Calculate proper scaling and positioning for clones
  const baseSize = 3;
  const scaleMultiplier = 0.11;
  const scaleX = 1 + ((size.width - baseSize) / baseSize) * scaleMultiplier;
  const scaleZ = 1 + ((size.height - baseSize) / baseSize) * scaleMultiplier;
  const scaleY = 1 + (((scaleX - 1) + (scaleZ - 1)) / 2);
  
  const actualVerandaWidth = baseSize * scaleX;
  const spacingBuffer = 0; // Reduced from 0.5 to 0.1 for smaller gap
  const totalSpacing = actualVerandaWidth + spacingBuffer;

  // Create veranda function
  const createVeranda = (verandaNumber, offsetX = 0) => {
    const clonedVeranda = clonedScene.clone();
    
    // Apply same settings as main veranda
    clonedVeranda.traverse((child) => {
      // Handle roof visibility
      if (child.name === 'triangleroof') {
        child.visible = roofType === 'roof2';
      }
      if (child.name === 'planeroof') {
        child.visible = roofType === 'roof1';
      }

      // Apply same light settings
      const isCircleLight = child.name.match(/^Circle(\.?\d+)?$/);
      const isRectLight = child.name.match(/^Rect(\.?\d+)?$/);
      const isSquareLight = child.name.match(/^Square(\.?\d+)?$/);
      const isRodLight = child.name === 'rodlight' || child.name === 'rodlighttwo';

      if (isCircleLight) {
        child.visible = lightType === 'circle';
        if (child.material && lightType === 'circle') {
          child.material = lightMaterial.clone();
        }
      }
      if (isRectLight) {
        child.visible = lightType === 'rect';
        if (child.material && lightType === 'rect') {
          child.material = lightMaterial.clone();
        }
      }
      if (isSquareLight) {
        child.visible = lightType === 'square';
        if (child.material && lightType === 'square') {
          child.material = lightMaterial.clone();
        }
      }
      if (isRodLight) {
        child.visible = lightsOn;
        if (child.material) {
          child.material = lightMaterial.clone();
        }
      }

      // Apply same frame material
      if (child.material && child.material.name === 'Material.001') {
        child.material = frameMaterial;
      }

      // Configure shadows
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return (
      <group 
        key={`veranda-${verandaNumber}`}
        position={[offsetX, 0, 0]} 
        rotation={[0, 0, 0]} 
        scale={[scaleX, scaleY, scaleZ]}
      >
        <primitive object={clonedVeranda} />
      </group>
    );
  };

  return (
    <>
      {/* Main veranda (veranda 1) */}
      {createVeranda(1, 0)}

      {/* Second veranda */}
      {multiplier >= 2 && createVeranda(2, totalSpacing)}

      {/* Third veranda */}
      {multiplier === 3 && createVeranda(3, -totalSpacing)}
    </>
  );
};

// Preload the GLTF files safely
if (typeof window !== 'undefined') {
  try {
    useGLTF.preload('/h/veranda.glb');
  } catch (error) {
    console.warn('Failed to preload GLTF:', error);
  }
}

// Main export wrapped with ClientOnly and ErrorBoundary
const SimpleVerandaConfigurator = () => {
  return (
    <ErrorBoundary>
      <ClientOnly>
        <VerandaConfigurator />
      </ClientOnly>
    </ErrorBoundary>
  );
};

export default SimpleVerandaConfigurator;