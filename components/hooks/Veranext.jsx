import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
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

// Object Selection Modal Component
const ObjectSelectionModal = ({ isOpen, onClose, onSelect, verandaNumber }) => {
  if (!isOpen) return null;

  const contentOptions = [
    { id: 'fitness', name: 'Gym Box', icon: '🏋️', description: 'Professional workout equipment' },
    { id: 'wellness', name: 'Spa Box', icon: '🛁', description: 'Jacuzzi & relaxation area' },
    { id: 'recreation', name: 'Game Box', icon: '🎱', description: 'Billiards & entertainment' },
    { id: null, name: 'Veranda Only', icon: '🏗️', description: 'Clear this space' }
  ];

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
          minWidth: '320px',
          maxWidth: '90vw',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          zIndex: 10001,
          textAlign: 'center'
        }}
      >
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#1a1a1a'
        }}>
          Add Content to Space {verandaNumber}
        </h3>
        
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '14px',
          color: '#666',
          lineHeight: '1.5'
        }}>
          Choose what to place in this veranda space
        </p>
        
        <div style={{
          display: 'grid',
          gap: '12px',
          marginBottom: '24px'
        }}>
          {contentOptions.map(option => (
            <button
              key={option.id || 'remove'}
              onClick={() => {
                onSelect(option.id);
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#000';
                e.target.style.backgroundColor = '#f8f8f8';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.backgroundColor = 'white';
              }}
            >
              <div style={{
                fontSize: '32px',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f8f8',
                borderRadius: '8px'
              }}>
                {option.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '4px'
                }}>
                  {option.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666'
                }}>
                  {option.description}
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <button
          onClick={onClose}
          style={{
            padding: '12px 24px',
            backgroundColor: '#f0f0f0',
            color: '#666',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Cancel
        </button>
      </div>
    </>
  );
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

// WebXR AR Modal Component
const ARModal = ({ isOpen, onClose, size, materialColor, multiplier }) => {
  const [arSupported, setArSupported] = useState(false);
  const [arSession, setArSession] = useState(null);
  const [arStatus, setArStatus] = useState('Checking AR support...');
  const [isPlacing, setIsPlacing] = useState(false);
  const [placedBoxes, setPlacedBoxes] = useState([]);

  // Check AR support on mount
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && 'xr' in navigator) {
      navigator.xr.isSessionSupported('immersive-ar')
        .then(supported => {
          setArSupported(supported);
          setArStatus(supported ? 'AR Ready! Tap "Start AR" to begin.' : 'AR not supported on this device');
        })
        .catch(() => {
          setArSupported(false);
          setArStatus('AR not available. Try on a mobile device with AR support.');
        });
    } else if (isOpen) {
      setArSupported(false);
      setArStatus('AR requires HTTPS and WebXR support');
    }
  }, [isOpen]);

  const startARSession = async () => {
    try {
      setArStatus('Starting AR session...');
      
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body }
      });

      setArSession(session);
      setArStatus('AR session active. Point camera at flat surface and tap to place.');
      setIsPlacing(true);

      // Initialize WebXR rendering
      initializeARRendering(session);

      session.addEventListener('end', () => {
        setArSession(null);
        setIsPlacing(false);
        setArStatus('AR session ended');
        setPlacedBoxes([]);
      });

    } catch (error) {
      console.error('Failed to start AR:', error);
      setArStatus('Failed to start AR. Make sure you\'re on a supported device.');
    }
  };

  const initializeARRendering = (session) => {
    // Create WebGL context for AR
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { xrCompatible: true });
    
    if (!gl) {
      setArStatus('WebGL not supported');
      return;
    }

    // Initialize WebXR layers
    session.updateRenderState({
      baseLayer: new XRWebGLLayer(session, gl)
    });

    // Get reference space
    session.requestReferenceSpace('local-floor').then(referenceSpace => {
      // Create hit test source for ground plane detection
      session.requestHitTestSource({ space: referenceSpace }).then(hitTestSource => {
        
        // Animation loop
        const onXRFrame = (time, frame) => {
          session.requestAnimationFrame(onXRFrame);

          const pose = frame.getViewerPose(referenceSpace);
          if (!pose) return;

          // Get hit test results
          const hitTestResults = frame.getHitTestResults(hitTestSource);
          if (hitTestResults.length > 0 && isPlacing) {
            const hit = hitTestResults[0];
            const hitPose = hit.getPose(referenceSpace);
            
            // Here you would render the AR content
            // For now, we'll just track hit positions
            renderARContent(gl, pose, hitPose);
          }
        };

        session.requestAnimationFrame(onXRFrame);

        // Handle tap to place
        canvas.addEventListener('touchstart', (event) => {
          if (isPlacing && hitTestResults && hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const hitPose = hit.getPose(referenceSpace);
            
            // Add box at hit position
            setPlacedBoxes(prev => [...prev, {
              id: Date.now(),
              position: [hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z],
              size: size,
              color: materialColor,
              multiplier: multiplier
            }]);
          }
        });
      });
    });
  };

  const renderARContent = (gl, viewerPose, hitPose) => {
    // Basic WebGL rendering for AR box
    // This is a simplified version - in production you'd use a full 3D engine
    
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Render placed boxes and hit indicator
    // Implementation would depend on your WebGL setup
  };

  const endARSession = () => {
    if (arSession) {
      arSession.end();
    }
  };

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
        onClick={!arSession ? onClose : undefined}
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
          backgroundColor: arSession ? '#4CAF50' : '#4285f4',
          borderRadius: '50%',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          {arSession ? '👁️' : '📱'}
        </div>
        
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#1a1a1a'
        }}>
          {arSession ? 'AR Active' : 'AR View'}
        </h3>
        
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '14px',
          color: '#666',
          lineHeight: '1.5'
        }}>
          {arStatus}
        </p>

        {arSession && placedBoxes.length > 0 && (
          <div style={{
            marginBottom: '24px',
            padding: '12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#0369a1'
          }}>
            {placedBoxes.length} veranda{placedBoxes.length !== 1 ? 's' : ''} placed
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {arSupported && !arSession && (
            <button
              onClick={startARSession}
              style={{
                padding: '12px 24px',
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Start AR
            </button>
          )}
          
          {arSession && (
            <button
              onClick={endARSession}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              End AR
            </button>
          )}
          
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: arSession ? '#666' : '#000',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {arSession ? 'Close' : 'Got it'}
          </button>
        </div>

        {/* AR Instructions */}
        {arSession && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#856404',
            textAlign: 'left'
          }}>
            <strong>How to use AR:</strong><br />
            1. Point your camera at a flat surface<br />
            2. Wait for the surface to be detected<br />
            3. Tap the screen to place a veranda box<br />
            4. Move around to see it from different angles
          </div>
        )}
      </div>
    </>
  );
};

// Mobile Touch Disclaimer Component
const TouchDisclaimer = ({ isVisible, message, onClose }) => {
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '25px',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: 5000,
        textAlign: 'center',
        maxWidth: '90vw',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        animation: 'fadeInSlideUp 0.3s ease-out'
      }}
      onClick={onClose}
    >
      {message}
      <style jsx>{`
        @keyframes fadeInSlideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// Enhanced Clickable Veranda Component with mobile touch disclaimer
const ClickableVeranda = ({ 
  children, 
  verandaNumber, 
  onDoubleClick, 
  position, 
  rotation, 
  scale, 
  hasContent,
  mobile 
}) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [showTouchDisclaimer, setShowTouchDisclaimer] = useState(false);
  const lastClickTimeRef = useRef(0);
  const touchDisclaimerTimeoutRef = useRef(null);

  // Handle click/touch events
  const handleClick = (event) => {
    event.stopPropagation();
    
    const currentTime = Date.now();
    const timeSinceLastClick = currentTime - lastClickTimeRef.current;
    
    // Double-click detection (same as before)
    if (timeSinceLastClick < 400 && timeSinceLastClick > 50) {
      console.log(`Double-click detected on veranda ${verandaNumber}`);
      onDoubleClick(verandaNumber);
      lastClickTimeRef.current = 0;
      setShowTouchDisclaimer(false);
      if (touchDisclaimerTimeoutRef.current) {
        clearTimeout(touchDisclaimerTimeoutRef.current);
      }
    } else {
      lastClickTimeRef.current = currentTime;
      
      // Show touch disclaimer on mobile for single taps
      if (mobile) {
        setShowTouchDisclaimer(true);
        
        // Clear existing timeout
        if (touchDisclaimerTimeoutRef.current) {
          clearTimeout(touchDisclaimerTimeoutRef.current);
        }
        
        // Hide disclaimer after 3 seconds
        touchDisclaimerTimeoutRef.current = setTimeout(() => {
          setShowTouchDisclaimer(false);
        }, 3000);
      }
    }
  };

  // Handle touch disclaimer close
  const handleDisclaimerClose = () => {
    setShowTouchDisclaimer(false);
    if (touchDisclaimerTimeoutRef.current) {
      clearTimeout(touchDisclaimerTimeoutRef.current);
    }
  };

  // Update cursor on hover (desktop only)
  useEffect(() => {
    if (!mobile) {
      document.body.style.cursor = hovered ? 'pointer' : 'auto';
    }
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered, mobile]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (touchDisclaimerTimeoutRef.current) {
        clearTimeout(touchDisclaimerTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <group
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onPointerOver={(e) => {
          if (!mobile) {
            e.stopPropagation();
            setHovered(true);
          }
        }}
        onPointerOut={(e) => {
          if (!mobile) {
            e.stopPropagation();
            setHovered(false);
          }
        }}
        onClick={handleClick}
      >
        {children}
        
        {/* Desktop hover indicator */}
        {!mobile && hovered && (
          <Html center position={[0, 2.8, 0]}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Double-click to {hasContent ? 'change' : 'add'} content
            </div>
          </Html>
        )}
      </group>

      {/* Mobile touch disclaimer */}
      {mobile && (
        <TouchDisclaimer
          isVisible={showTouchDisclaimer}
          message={`Tap again quickly to ${hasContent ? 'change' : 'add'} content in Space ${verandaNumber}`}
          onClose={handleDisclaimerClose}
        />
      )}
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
  showARModal, setShowARModal, timeOfDay, setTimeOfDay, multiplier, setMultiplier,
  verandaContents = {}, setVerandaContent
}) => {
  
  const contentOptions = [
    { id: 'fitness', name: 'Gym Box', icon: '⚪', description: 'Professional workout equipment' },
    { id: 'wellness', name: 'Spa Box', icon: '⚫', description: 'Jacuzzi & relaxation area' },
    { id: 'recreation', name: 'Game Box', icon: '⚪', description: 'Billiards & entertainment' }
  ];

  return (
    <div style={{ 
      width: '100%',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: mobile ? '20px' : '32px 24px'
    }}>
      <h2 style={{ 
        margin: '0 0 24px 0', 
        fontSize: mobile ? '24px' : '28px', 
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: '-0.03em'
      }}>
        Configure
      </h2>
      
      {/* Size Options - Now with AI parsing */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '16px', 
          fontWeight: '600',
          color: '#1a1a1a',
          letterSpacing: '-0.02em'
        }}>
          Dimensions
        </h3>
        
        {/* Current dimensions display */}
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f8f8f8',
          borderRadius: '8px',
          marginBottom: '12px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#000' }}>
            {size.width}m × {size.height}m
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
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
              padding: '12px 16px',
              border: '1px solid #d0d0d0',
              borderRadius: '8px',
              fontSize: '14px',
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
              padding: '12px 16px',
              border: isListening ? '2px solid #ff4444' : '1px solid #d0d0d0',
              borderRadius: '8px',
              backgroundColor: isListening ? '#fff5f5' : (speechSupported ? 'white' : '#f5f5f5'),
              cursor: speechSupported ? 'pointer' : 'not-allowed',
              fontSize: '14px',
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
            fontSize: '11px',
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
            fontSize: '11px',
            color: parseStatus.type === 'success' ? '#0369a1' : '#dc2626'
          }}>
            {parseStatus.message}
          </div>
        )}
      </div>

      {/* Multiplier Options */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '16px', 
          fontWeight: '600',
          color: '#1a1a1a',
          letterSpacing: '-0.02em'
        }}>
          Layout
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          {[
            { type: 1, icon: '1️⃣', label: 'Single' },
            { type: 2, icon: '2️⃣', label: '2x Side' },
            { type: 3, icon: '3️⃣', label: '3x Side' }
          ].map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => setMultiplier(type)}
              style={{
                padding: '16px 12px',
                border: multiplier === type ? '3px solid #000' : '1px solid #d0d0d0',
                borderRadius: '8px',
                backgroundColor: multiplier === type ? '#f8f8f8' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                touchAction: 'manipulation',
                flexDirection: 'column'
              }}
            >
              <span style={{ fontSize: '20px' }}>{icon}</span>
              <span style={{
                fontSize: '12px',
                fontWeight: '500',
                color: multiplier === type ? '#000' : '#666'
              }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Assignment Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '16px', 
          fontWeight: '600',
          color: '#1a1a1a',
          letterSpacing: '-0.02em'
        }}>
          Space Content
        </h3>
        
        {/* Veranda content assignment */}
        {Array.from({ length: multiplier }, (_, i) => {
          const verandaIndex = i + 1;
          const currentContent = verandaContents ? verandaContents[verandaIndex] : null;
          const contentOption = contentOptions.find(opt => opt.id === currentContent);
          
          return (
            <div key={verandaIndex} style={{
              marginBottom: '16px',
              padding: '16px',
              border: '2px solid #f0f0f0',
              borderRadius: '12px',
              backgroundColor: 'white',
              transition: 'all 0.2s ease'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  letterSpacing: '-0.01em'
                }}>
                  Space {verandaIndex}
                </span>
                
                {/* Content selection dropdown */}
                <select
                  value={currentContent || ''}
                  onChange={(e) => setVerandaContent && setVerandaContent(verandaIndex, e.target.value || null)}
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: '500',
                    color: '#1a1a1a'
                  }}
                >
                  <option value="">Veranda Only</option>
                  {contentOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Current content display */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                backgroundColor: currentContent ? '#fafafa' : '#f8f8f8',
                borderRadius: '8px',
                border: `2px solid ${currentContent ? '#e0e0e0' : '#f0f0f0'}`
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: contentOption?.icon === '⚫' ? '#000' : '#fff',
                  border: contentOption?.icon === '⚫' ? 'none' : '2px solid #000',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  flexShrink: 0
                }}>
                  {contentOption 
                    ? (contentOption.icon === '⚫' ? '○' : '●')
                    : '○'
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '4px',
                    letterSpacing: '-0.01em'
                  }}>
                    {contentOption ? contentOption.name : 'Veranda Only'}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    lineHeight: '1.4'
                  }}>
                    {contentOption ? contentOption.description : 'Tap veranda in 3D view or use dropdown'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Time of Day Options */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '16px', 
          fontWeight: '600',
          color: '#1a1a1a',
          letterSpacing: '-0.02em'
        }}>
          Time of Day
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { type: 'day', icon: '☀️', label: 'Day' },
            { type: 'night', icon: '🌙', label: 'Night' }
          ].map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => setTimeOfDay(type)}
              style={{
                padding: '16px 12px',
                border: timeOfDay === type ? '3px solid #000' : '1px solid #d0d0d0',
                borderRadius: '8px',
                backgroundColor: timeOfDay === type ? '#f8f8f8' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                touchAction: 'manipulation'
              }}
            >
              <span style={{ fontSize: '20px' }}>{icon}</span>
              <span style={{
                fontSize: '14px',
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
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '16px', 
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
                padding: '12px 8px',
                border: lightType === type ? '2px solid #000' : '1px solid #d0d0d0',
                borderRadius: '8px',
                backgroundColor: lightType === type ? '#f8f8f8' : 'white',
                cursor: 'pointer',
                fontSize: '18px',
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
              <span style={{ fontSize: '11px', fontWeight: '500' }}>{label}</span>
            </button>
          ))}
        </div>
        
        {/* Light Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center', 
          marginTop: '12px',
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <button
            onClick={() => setLightsOn(!lightsOn)}
            style={{
              padding: '8px 16px',
              border: '1px solid #d0d0d0',
              borderRadius: '6px',
              backgroundColor: lightsOn ? '#000' : 'white',
              color: lightsOn ? 'white' : '#666',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              touchAction: 'manipulation'
            }}
          >
            {lightsOn ? 'ON' : 'OFF'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
            <span style={{ fontSize: '12px', color: '#666' }}>Color</span>
            <input
              type="color"
              value={lightColor}
              onChange={(e) => setLightColor(e.target.value)}
              style={{
                width: '32px',
                height: '32px',
                border: '1px solid #d0d0d0',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      </div>

      {/* Roof Options */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '16px', 
          fontWeight: '600',
          color: '#1a1a1a',
          letterSpacing: '-0.02em'
        }}>
          Roof Style
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                height: '80px',
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#f0f0f0'
              }} />
              <div style={{
                padding: '8px',
                fontSize: '12px',
                fontWeight: '500',
                color: roofType === type ? '#000' : '#666'
              }}>
                {label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* AR Button */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => setShowARModal(true)}
          style={{
            width: '100%',
            padding: '20px 16px',
            border: '2px solid #4285f4',
            borderRadius: '12px',
            backgroundColor: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'all 0.2s ease',
            touchAction: 'manipulation'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#4285f4';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.color = '#4285f4';
          }}
        >
          <span style={{ fontSize: '24px' }}>📱</span>
          <span style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#4285f4'
          }}>
            AR View
          </span>
        </button>
      </div>

      {/* Frame Color Options */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '16px', 
          fontWeight: '600',
          color: '#1a1a1a',
          letterSpacing: '-0.02em'
        }}>
          Frame Color
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { color: 'anthracite', hex: '#28282d', label: 'Anthracite' },
            { color: 'white', hex: '#f5f5f5', label: 'White' }
          ].map(({ color, hex, label }) => (
            <button
              key={color}
              onClick={() => setMaterialColor(color)}
              style={{
                padding: '16px 12px',
                border: materialColor === color ? '3px solid #000' : '1px solid #d0d0d0',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease',
                touchAction: 'manipulation'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: hex,
                borderRadius: '50%',
                border: '1px solid #ddd'
              }} />
              <span style={{
                fontSize: '14px',
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

// Camera Controller for smooth zooming and ground transparency
const CameraController = ({ multiplier, mobile }) => {
  const { camera } = useThree();
  const controlsRef = useRef();

  useFrame(() => {
    // Make ground transparent when camera goes below it
    const groundYPosition = -0.45; // Approximate ground level
    if (camera.position.y < groundYPosition) {
      // Camera is below ground, we'll handle this in the VerandaModel component
    }
  });

  // Smooth camera adjustment when multiplier changes
  useEffect(() => {
    if (!controlsRef.current) return;

    let targetPosition, cameraPosition, maxDistance;

    switch (multiplier) {
      case 1:
        targetPosition = [6, 0.7, 3];
        cameraPosition = [-8, 3.5, 12];
        maxDistance = 24;
        break;
      case 2:
        targetPosition = [6.5, 0.7, 3];
        cameraPosition = [-11, 4, 16];
        maxDistance = 30;
        break;
      case 3:
        targetPosition = [6, 0.7, 3];
        cameraPosition = [-13, 6.5, 20];
        maxDistance = 36;
        break;
      default:
        targetPosition = [6, 0.7, 3];
        cameraPosition = [2, 3.5, 12];
        maxDistance = 24;
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
      maxDistance={24} // Will be updated by useEffect
      target={[6, 0.7, 3]}
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
  const [showARModal, setShowARModal] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [multiplier, setMultiplier] = useState(1);

  // Content management states
  const [verandaContents, setVerandaContents] = useState({}); // { 1: 'gym', 2: 'spa', 3: 'games' }
  
  // Interactive object insertion states
  const [showObjectModal, setShowObjectModal] = useState(false);
  const [selectedVeranda, setSelectedVeranda] = useState(null);

  // New states for AI dimension parsing and recording
  const [dimensionInput, setDimensionInput] = useState('3m by 3m');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [parseStatus, setParseStatus] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  // Helper function to set content for a specific veranda
  const setVerandaContent = (verandaNumber, contentType) => {
    setVerandaContents(prev => ({
      ...prev,
      [verandaNumber]: contentType
    }));
  };

  // Handler for veranda double-click
  const handleVerandaDoubleClick = (verandaNumber) => {
    setSelectedVeranda(verandaNumber);
    setShowObjectModal(true);
  };

  // Handler for object selection
  const handleObjectSelection = (contentType) => {
    if (selectedVeranda) {
      setVerandaContent(selectedVeranda, contentType);
    }
  };

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

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex',
      flexDirection: mobile ? 'column' : 'row',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Object Selection Modal */}
      <ObjectSelectionModal 
        isOpen={showObjectModal}
        onClose={() => {
          setShowObjectModal(false);
          setSelectedVeranda(null);
        }}
        onSelect={handleObjectSelection}
        verandaNumber={selectedVeranda}
      />

      {/* Recording Modal */}
      <RecordingModal 
        isOpen={isListening} 
        onClose={() => setIsListening(false)}
        status={parseStatus?.message}
      />

      {/* AR Modal */}
      <ARModal 
        isOpen={showARModal} 
        onClose={() => setShowARModal(false)}
        size={size}
        materialColor={materialColor}
        multiplier={multiplier}
      />

      {/* Canvas Section */}
      <div style={{ 
        width: '100vw', 
        height: mobile ? '75vh' : '100vh',
        position: 'relative'
      }}>
        <Suspense fallback={<SimpleFallback />}>
          <Canvas 
            shadows={true}
            camera={{ 
              position: [2, 1.5, 12], // Zoomed out further from [1,.5,8]
              fov: mobile ? 85 : 65  // Slightly wider FOV
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
                verandaContents={verandaContents}
                onVerandaDoubleClick={handleVerandaDoubleClick}
              />
              
              <Environment 
                files={timeOfDay === 'night' ? "/sandsloot.hdr" : "/blouberg_sunrise_2_1k.hdr"}
                background
                backgroundIntensity={timeOfDay === 'night' ? 0.8 : 1.4}
              />
              <CameraController multiplier={multiplier} mobile={mobile} />
            </Suspense>
          </Canvas>
        </Suspense>
      </div>

      {/* Configurator Section */}
      <div style={{
        width: mobile ? '100vw' : '30%',
        height: mobile ? '25vh' : '100vh',
        backgroundColor: '#fafafa',
        borderLeft: mobile ? 'none' : '1px solid #e0e0e0',
        borderTop: mobile ? '1px solid #e0e0e0' : 'none',
        overflowY: 'auto',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <ConfiguratorContent 
          {...{
            size, setSize, lightType, setLightType, lightsOn, setLightsOn,
            lightColor, setLightColor, roofType, setRoofType, 
            materialColor, setMaterialColor, mobile,
            dimensionInput, setDimensionInput, isListening, toggleVoiceInput,
            speechSupported, parseDimensions, parseStatus,
            showARModal, setShowARModal, timeOfDay, setTimeOfDay, multiplier, setMultiplier,
            verandaContents, setVerandaContent
          }}
        />
      </div>
    </div>
  );
};

const VerandaModel = ({ 
  size, lightType, lightsOn, lightColor, roofType, materialColor, mobile, 
  timeOfDay, multiplier, verandaContents = {}, onVerandaDoubleClick
}) => {
  const { scene } = useGLTF('https://cdn.shopify.com/3d/models/bc863a6a765ab46f/veranda.glb');
  const { scene: sceneAddition } = useGLTF('/sceneaddition.glb');
  const { scene: pooltableScene } = useGLTF('/pooltable.glb');
  const { scene: gymScene } = useGLTF('/h/gym.glb');
  const { scene: jacuzziScene } = useGLTF('/jacuzzi.glb');
  const groupRef = useRef();
  const directionalLightRef = useRef();
  const pointLightRef = useRef();
  const sceneAdditionRef = useRef();
  
  // Create fixed refs for each possible veranda (up to 3)
  const veranda1Ref = useRef();
  const veranda2Ref = useRef();
  const veranda3Ref = useRef();
  const verandaRefs = [veranda1Ref, veranda2Ref, veranda3Ref];

  const { camera } = useThree();

  // Force initial render to ensure shadows appear immediately and handle ground transparency
  useFrame((state) => {
    if (directionalLightRef.current && directionalLightRef.current.shadow && directionalLightRef.current.shadow.map) {
      directionalLightRef.current.shadow.map.needsUpdate = true;
    }

    // Handle ground and plane transparency when camera is below ground level
    const groundYPosition = -0.25;
    const shouldBeTransparent = camera.position.y < groundYPosition;

    // Handle ground transparency in scene addition
    if (sceneAdditionRef.current) {
      sceneAdditionRef.current.traverse((child) => {
        if (child.name === 'ground' && child.material) {
          if (shouldBeTransparent) {
            child.material.transparent = true;
            child.material.opacity = 0.08;
          } else {
            child.material.transparent = false;
            child.material.opacity = 1.0;
          }
          child.material.needsUpdate = true;
        }
      });
    }

    // Handle plane transparency in veranda models
    verandaRefs.forEach((verandaRef) => {
      if (verandaRef && verandaRef.current) {
        verandaRef.current.traverse((child) => {
          if (child.name === 'Plane' && child.material) {
            if (shouldBeTransparent) {
              child.material.transparent = true;
              child.material.opacity = 0;
            } else {
              child.material.transparent = false;
              child.material.opacity = 1.0;
            }
            child.material.needsUpdate = true;
          }
        });
      }
    });
  });

  // Memoize the cloned scene and materials to prevent recreation
  const { clonedScene, frameMaterial, glassMaterial, lightMaterial } = useMemo(() => {
    if (!scene) return { clonedScene: null, frameMaterial: null, glassMaterial: null, lightMaterial: null };

    const clonedScene = scene.clone();

    // Create frame material with proper color for structural elements
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: materialColor === 'anthracite' ? '#28282d' : '#f5f5f5',
      metalness: 0.995,
      roughness: 0.2
    });

    // Create glass material for all glass objects
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: '#9c1515ff',
      metalness: 0,
      roughness: 0.1,
      ior: 1.5,
      transmission: 0.19,
      transparent: true,
      thickness: 0.201,
      envMapIntensity: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.1
    });

    // Create glowing light material with enhanced bloom effect - opposite to frame color
    const lightObjectColor = materialColor === 'anthracite' ? '#f5f5f5' : '#28282d'; // Opposite of frame color
    const lightMaterial = new THREE.MeshStandardMaterial({
      color: lightsOn ? lightObjectColor : '#333333',
      emissive: lightsOn ? lightColor : '#000000', // Use lightColor for emissive glow
      emissiveIntensity: lightsOn ? (timeOfDay === 'night' ? 2.5 : 2.0) : 0, // Increased intensity for bloom effect
      transparent: true,
      opacity: lightsOn ? 1 : 0.3
    });

    return {
      clonedScene,
      frameMaterial,
      glassMaterial,
      lightMaterial
    };
  }, [scene, mobile, materialColor, lightsOn, lightColor, timeOfDay]);

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
        child.receiveShadow = false;
      }
    });

    // Configure sceneAddition objects to receive shadows
    if (sceneAddition) {
      sceneAddition.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = true;
        }
      });
    }

    // Handle scaling for size with REDUCED multiplier effect
    if (groupRef.current) {
      const baseSize = 3;
      const scaleMultiplier = 0.11;
      
      const scaleX = 1 + ((size.width - baseSize) / baseSize) * scaleMultiplier;
      const scaleZ = 1 + ((size.height - baseSize) / baseSize) * scaleMultiplier;
      const scaleY = 1 + (((scaleX - 1) + (scaleZ - 1)) / 40);
      
      groupRef.current.scale.set(scaleX, scaleY, scaleZ);
    }

  }, [clonedScene, frameMaterial, lightMaterial, size.width, size.height, lightType, roofType, mobile, sceneAddition, lightsOn, lightColor, timeOfDay]);

  // Force shadow update on mobile after mounting
  useEffect(() => {
    if (mobile && directionalLightRef.current) {
      const timer = setTimeout(() => {
        if (directionalLightRef.current.shadow && directionalLightRef.current.shadow.map) {
          directionalLightRef.current.shadow.map.needsUpdate = true;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mobile]);

  if (!clonedScene || !frameMaterial || !glassMaterial || !lightMaterial) {
    return null;
  }

  // Calculate proper scaling and positioning for clones
  const baseSize = 3;
  const scaleMultiplier = 0.11;
  const scaleX = 1 + ((size.width - baseSize) / baseSize) * scaleMultiplier;
  const scaleZ = 1 + ((size.height - baseSize) / baseSize) * scaleMultiplier;
  const scaleY = 1 + (((scaleX - 1) + (scaleZ - 1)) / 2);
  
  const actualVerandaWidth = baseSize * scaleX;
  const spacingBuffer = 0.05;
  const totalSpacing = actualVerandaWidth + spacingBuffer;

  // Create veranda with interactive capabilities
  const createVeranda = (verandaNumber, offsetX = 0, verandaRef) => {
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
        child.receiveShadow = false;
      }
    });

    const hasContent = verandaContents && verandaContents[verandaNumber];

    return (
      <ClickableVeranda
        key={`veranda-${verandaNumber}`}
        verandaNumber={verandaNumber}
        onDoubleClick={onVerandaDoubleClick}
        position={[6 + offsetX, -0.5, 3]}
        rotation={[0, -Math.PI/2, 0]}
        scale={[scaleX, scaleY, scaleZ]}
        hasContent={!!hasContent}
        mobile={mobile}
      >
        <primitive ref={verandaRef} object={clonedVeranda} />
      </ClickableVeranda>
    );
  };

  // Get content objects based on veranda contents
  const getContentObject = (contentType, position, rotation = [0, -Math.PI/2, 0]) => {
    switch (contentType) {
      case 'fitness':
        return gymScene && (
          <primitive 
            object={gymScene.clone()} 
            position={position}
            rotation={rotation}
            scale={[1, 1, 1]}
          />
        );
      case 'wellness':
        return jacuzziScene && (
          <primitive 
            object={jacuzziScene.clone()} 
            position={position}
            rotation={rotation}
            scale={[1, 1, 1]}
          />
        );
      case 'recreation':
        return pooltableScene && (
          <primitive 
            object={pooltableScene.clone()} 
            position={position}
            rotation={rotation}
            scale={[1, 1, 1]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Ambient light for general illumination */}
      <ambientLight intensity={timeOfDay === 'night' ? 0.15 : (mobile ? 0.4 : 0.3)} />
      
      {/* Directional light that looks at the veranda and casts shadows */}
      <directionalLight
        ref={directionalLightRef}
        position={[5, 7, -3.8]}
        target-position={[6, 0, 3]}
        intensity={timeOfDay === 'night' ? (mobile ? 0.43 : 0.54) : (mobile ? 1.86 : 1.98)}
        color={timeOfDay === 'night' ? '#b8c5d1' : '#ffffff'}
        castShadow={true}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-radius={6}
        shadow-bias={-0.0005}
      />

      {/* Point light at center of veranda when lights are on */}
      {lightsOn && (
        <pointLight
          ref={pointLightRef}
          position={[6, 2, 3]}
          intensity={timeOfDay === 'night' ? .65 : 0.8}
          color={lightColor}
          distance={20}
          decay={2}
          castShadow={false}
        />
      )}

      {/* Additional point lights for each veranda with rod lights (bloom simulation) */}
      {lightsOn && multiplier >= 1 && (
        <pointLight
          position={[6, 1.5, 3]}
          intensity={0.3}
          color={lightColor}
          distance={8}
          decay={2}
        />
      )}
      {lightsOn && multiplier >= 2 && (
        <pointLight
          position={[6 + totalSpacing, 1.5, 3]}
          intensity={0.3}
          color={lightColor}
          distance={8}
          decay={2}
        />
      )}
      {lightsOn && multiplier === 3 && (
        <pointLight
          position={[6 - totalSpacing, 1.5, 3]}
          intensity={0.3}
          color={lightColor}
          distance={8}
          decay={2}
        />
      )}

      {/* Additional ambient lighting when lights are on */}
      {lightsOn && (
        <ambientLight intensity={timeOfDay === 'night' ? 0.4 : 0.25} color={lightColor} />
      )}

      {/* Scene addition - NOT affected by scaling, with ground transparency handling */}
      {sceneAddition && (
        <primitive 
          ref={sceneAdditionRef}
          object={sceneAddition.clone()} 
          position={[0, -0.68, 0]} 
          rotation={[0, 0, 0]}
        />
      )}
      
      {/* Main veranda (veranda 1) */}
      {createVeranda(1, 0, verandaRefs[0])}

      {/* Content for main veranda */}
      {verandaContents && verandaContents[1] && getContentObject(verandaContents[1], [6, -0.45, 3], [0, -Math.PI/2, 0])}

      {/* Second veranda */}
      {multiplier >= 2 && createVeranda(2, totalSpacing, verandaRefs[1])}
      {multiplier >= 2 && verandaContents && verandaContents[2] && getContentObject(verandaContents[2], [6.25 + totalSpacing, -0.5, 3], [0, Math.PI, 0])}

      {/* Third veranda */}
      {multiplier === 3 && createVeranda(3, -totalSpacing, verandaRefs[2])}
      {multiplier === 3 && verandaContents && verandaContents[3] && getContentObject(verandaContents[3], [6 - totalSpacing, -0.5, 3], [0, -Math.PI/2, 0])}
    </>
  );
};

// Preload the GLTF files safely
if (typeof window !== 'undefined') {
  try {
    useGLTF.preload('/h/veranda.glb');
    useGLTF.preload('/sceneaddition.glb');
    useGLTF.preload('/pooltable.glb');
    useGLTF.preload('/h/gym.glb');
    useGLTF.preload('/jacuzzi.glb');
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