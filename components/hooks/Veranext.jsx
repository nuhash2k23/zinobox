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
          {status || 'Speak your veranda dimensions clearly. For example: "8 meters by 8 meters"'}
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

// AR Development Modal Component
const ARModal = ({ isOpen, onClose }) => {
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
          backgroundColor: '#4285f4',
          borderRadius: '50%',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          📱
        </div>
        
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#1a1a1a'
        }}>
          AR View
        </h3>
        
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '14px',
          color: '#666',
          lineHeight: '1.5'
        }}>
          🚧 Under Development<br />
          Work in Progress<br /><br />
          AR functionality is coming soon! This will allow you to visualize your veranda in your actual space.
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
          Got it
        </button>
      </div>
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
  showARModal, setShowARModal, timeOfDay, setTimeOfDay
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
      
      {/* Size Options - Now with AI parsing */}
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
            placeholder="e.g., 5 by 6 meters, 4x3m, 5 meter by 6 meter"
            value={dimensionInput}
            onChange={(e) => {
              setDimensionInput(e.target.value);
              parseDimensions(e.target.value);
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
            onFocus={(e) => e.target.style.borderColor = '#000'}
            onBlur={(e) => e.target.style.borderColor = '#d0d0d0'}
          />
        </div>

        {/* Voice input button */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={toggleVoiceInput}
            disabled={!speechSupported}
            style={{
              flex: mobile ? '1 1 100%' : '1 1 auto',
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
              gap: '6px',
              marginBottom: mobile ? '8px' : '0'
            }}
          >
            <span>{isListening ? '🛑' : '🎤'}</span>
            {isListening ? 'Recording... (Click to Stop)' : (speechSupported ? 'Voice Input' : 'Voice Disabled')}
          </button>
          
          {/* Manual speech input as fallback */}
          <button
            onClick={() => {
              const speechText = prompt("Enter what you would say (e.g., '8 meter by 8 meter'):");
              if (speechText) {
                setDimensionInput(speechText);
                parseDimensions(speechText);
              }
            }}
            style={{
              padding: mobile ? '8px 12px' : '10px 14px',
              border: '1px solid #d0d0d0',
              borderRadius: '6px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: mobile ? '10px' : '12px',
              fontWeight: '500',
              color: '#666',
              transition: 'all 0.2s ease',
              touchAction: 'manipulation'
            }}
          >
            📝 Manual
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

      {/* Time of Day Options */}
      <div style={{ marginBottom: mobile ? '20px' : '32px' }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          fontSize: mobile ? '14px' : '16px', 
          fontWeight: '500',
          color: '#333',
          letterSpacing: '-0.01em'
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

      {/* AR Button */}
      <div style={{ marginBottom: mobile ? '16px' : '24px' }}>
        <button
          onClick={() => setShowARModal(true)}
          style={{
            width: '100%',
            padding: mobile ? '16px 12px' : '20px 16px',
            border: '2px solid #4285f4',
            borderRadius: '12px',
            backgroundColor: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: mobile ? '8px' : '12px',
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
          <span style={{ fontSize: mobile ? '20px' : '24px' }}>📱</span>
          <span style={{
            fontSize: mobile ? '14px' : '16px',
            fontWeight: '600',
            color: '#4285f4'
          }}>
            AR View
          </span>
        </button>
      </div>

      {/* Frame Color Options */}
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
  const [size, setSize] = useState({ width: 3, height: 3 });
  const [lightType, setLightType] = useState('circle');
  const [lightsOn, setLightsOn] = useState(false); // Default off for better performance
  const [lightColor, setLightColor] = useState('#ffd700');
  const [roofType, setRoofType] = useState('roof1');
  const [materialColor, setMaterialColor] = useState('anthracite');
  const [configOpen, setConfigOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [showARModal, setShowARModal] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('day'); // 'day' or 'night'

  // New states for AI dimension parsing and recording
  const [dimensionInput, setDimensionInput] = useState('3m by 3m');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [parseStatus, setParseStatus] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  // Dimension parsing function with enhanced patterns
  const parseDimensions = (text) => {
    if (!text.trim()) {
      setParseStatus(null);
      return;
    }

    // Normalize the text for better matching
    const normalizedText = text.toLowerCase()
      .replace(/\s+/g, ' ') // Multiple spaces to single space
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

    console.log('Normalized text:', normalizedText); // Debug log

    // Clear any existing status after a delay
    setTimeout(() => setParseStatus(null), 4000);

    // Enhanced regex patterns to catch different formats
    const patterns = [
      // "8 meter by 8 meter", "8 meters by 8 meters"
      /(\d+(?:\.\d+)?)\s*(?:m|meter|meters)\s*(?:by|x|×|and)\s*(\d+(?:\.\d+)?)\s*(?:m|meter|meters)/i,
      // "8 by 8", "8 by 8 meters"
      /(\d+(?:\.\d+)?)\s*(?:by|x|×|and)\s*(\d+(?:\.\d+)?)\s*(?:m|meter|meters)?/i,
      // "8x8", "8×8", "8 x 8"
      /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i,
      // "veranda of 8 meter by 8 meter"
      /(?:veranda|structure|size|dimension).*?(\d+(?:\.\d+)?)\s*(?:m|meter|meters)?\s*(?:by|x|×|and)\s*(\d+(?:\.\d+)?)\s*(?:m|meter|meters)?/i,
      // "8 and 8 meters", "8 to 8 meters"
      /(\d+(?:\.\d+)?)\s*(?:and|to|by)\s*(\d+(?:\.\d+)?)\s*(?:m|meter|meters)/i,
      // Just two numbers with some separator
      /(\d+(?:\.\d+)?)\s+(?:to|and|by|\s)\s*(\d+(?:\.\d+)?)/i
    ];

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = normalizedText.match(pattern);
      console.log(`Pattern ${i + 1}:`, pattern, 'Match:', match); // Debug log
      
      if (match) {
        const width = parseFloat(match[1]);
        const height = parseFloat(match[2]);
        
        console.log('Parsed dimensions:', width, 'x', height); // Debug log
        
        // Validate dimensions (reasonable limits)
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

    // No valid dimensions found
    setParseStatus({
      type: 'error',
      message: `❌ Could not parse "${text}". Try "8 by 8 meters" or "8x8m"`
    });
  };

  // Recording functionality
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Setting up speech recognition...');
      
      // Check for microphone access
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
        // In a real implementation, you would send this to your backend
        // For now, we'll simulate processing
        setParseStatus({ type: 'info', message: '⏳ Processing audio...' });
        
        // Simulate processing delay
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
      />

      {/* Canvas Section */}
      <div style={{ 
        width: canvasWidth, 
        height: mobile ? '100vh' : '100vh',
        position: 'relative'
      }}>
        <Suspense fallback={<SimpleFallback />}>
          <Canvas 
            shadows={true} // Enable shadows on both desktop and mobile
            camera={{ 
              position: [-1,1,11], 
              fov: mobile ? 50 : 45 
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
              />
              {/* HDR Environment with background - changes based on time of day */}
              <Environment 
                files={timeOfDay === 'night' ? "/sandsloot.hdr" : "/blouberg_sunrise_2_1k.hdr"}
                background
                backgroundIntensity={timeOfDay === 'night' ? 0.8 : 1.4}
              />
              <OrbitControls 
                enablePan={!mobile}
                enableZoom={true}
                enableRotate={true}
                minPolarAngle={0}
                maxPolarAngle={Math.PI / 2.2}
                maxDistance={12}
                target={[6, 0.5 ,3]} // Match the model position
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
              materialColor, setMaterialColor, mobile,
              dimensionInput, setDimensionInput, isListening, toggleVoiceInput,
              speechSupported, parseDimensions, parseStatus,
              showARModal, setShowARModal, timeOfDay, setTimeOfDay
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
                  materialColor, setMaterialColor, mobile,
                  dimensionInput, setDimensionInput, isListening, toggleVoiceInput,
                  speechSupported, parseDimensions, parseStatus,
                  showARModal, setShowARModal, timeOfDay, setTimeOfDay
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const VerandaModel = ({ size, lightType, lightsOn, lightColor, roofType, materialColor, mobile, timeOfDay }) => {
  const { scene } = useGLTF('/veranda.glb');
  const { scene: sceneAddition } = useGLTF('/sceneaddition.glb');
  const groupRef = useRef();
  const directionalLightRef = useRef();

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

    // Create glowing light material - more prominent at night
    const lightMaterial = new THREE.MeshStandardMaterial({
      color: lightsOn ? lightColor : '#333333',
      emissive: lightsOn ? lightColor : '#000000',
      emissiveIntensity: lightsOn ? (timeOfDay === 'night' ? 1.5 : 1.0) : 0, // Brighter glow at night
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

      // Update frame materials
      if (child.material && child.material.name === 'Material.001') {
        child.material = frameMaterial;
      }

      // Configure shadows for meshes
      if (child.isMesh) {
        child.castShadow = true; // Veranda casts shadows on both desktop and mobile
        child.receiveShadow = false; // Veranda doesn't receive shadows
      }
    });

    // Configure sceneAddition objects to receive shadows
    if (sceneAddition) {
      sceneAddition.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false; // House doesn't cast shadows
          child.receiveShadow = true; // House receives shadows on both desktop and mobile
        }
      });
    }

    // Handle scaling for size with REDUCED multiplier effect
    if (groupRef.current) {
      // Calculate scale with smaller multiplier (0.11 for subtle scaling)
      const baseSize = 3;
      const scaleMultiplier = 0.11; // Reduce scale effect
      
      const scaleX = 1 + ((size.width - baseSize) / baseSize) * scaleMultiplier;
      const scaleZ = 1 + ((size.height - baseSize) / baseSize) * scaleMultiplier;
      // Scale Y based on average of X and Z for proportional height
      const scaleY = 1 + (((scaleX - 1) + (scaleZ - 1)) / 2);
      
      groupRef.current.scale.set(scaleX, scaleY, scaleZ);
    }

  }, [clonedScene, frameMaterial, lightMaterial, size.width, size.height, lightType, roofType, mobile, sceneAddition, lightsOn, lightColor, timeOfDay]);

  if (!clonedScene || !frameMaterial || !glassMaterial || !lightMaterial) {
    return null;
  }

  return (
    <>
      {/* Ambient light for general illumination - dimmer at night */}
      <ambientLight intensity={timeOfDay === 'night' ? 0.15 : (mobile ? 0.4 : 0.3)} />
      
      {/* Directional light that looks at the veranda and casts shadows - dimmer at night */}
      <directionalLight
        ref={directionalLightRef}
        position={[10, 15, 8]} // Position above and to the side
        target-position={[6, 0, 3]} // Look at the veranda position
        intensity={timeOfDay === 'night' ? (mobile ? 0.43 : 0.54) : (mobile ? 0.86 : 0.98)}
        color={timeOfDay === 'night' ? '#b8c5d1' : '#ffffff'} // Slightly blue moonlight at night
        castShadow={true} // Enable shadows on both desktop and mobile
        shadow-mapSize={[1024, 1024]} // 1024 shadow map size for both desktop and mobile
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-radius={6}
        shadow-bias={-0.0005}
      />

      {/* Additional ambient lighting when lights are on for better visibility - more important at night */}
      {lightsOn && (
        <ambientLight intensity={timeOfDay === 'night' ? 0.4 : 0.25} color={lightColor} />
      )}

      {/* Scene addition - NOT affected by scaling (static scene elements) */}
      {sceneAddition && (
        <primitive 
          object={sceneAddition.clone()} 
          position={[0, -0.5, 0]} 
          rotation={[0, 0, 0]}
        />
      )}
      
      {/* Main veranda - AFFECTED by scaling (configurable dimensions) */}
      <group ref={groupRef} position={[6, -0.5, 3]} rotation={[0, -Math.PI/2, 0]}>
        <primitive object={clonedScene} />
      </group>
    </>
  );
};

// Preload the GLTF files safely
if (typeof window !== 'undefined') {
  try {
    useGLTF.preload('/veranda.glb');
    useGLTF.preload('/sceneaddition.glb');
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