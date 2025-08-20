import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Text3D, Center, OrbitControls, Environment } from '@react-three/drei';

// You can add any font URL here - just needs to be in .typeface.json format
const FONTS = {
  'Pacifico': 'https://cdn.shopify.com/s/files/1/0768/3709/3601/files/raustila_Regular.json?v=1755296484',
  'Pacifico Alt': 'https://cdn.shopify.com/s/files/1/0768/3709/3601/files/Pacifico_Regular_1.json?v=1755295127',

  'Droid Sans': 'https://cdn.shopify.com/s/files/1/0768/3709/3601/files/Winterain_Regular_1.json?v=1755295991'
};

// 3D Text Component
function ThreeDText({ text, selectedFont }) {
  if (!text) return null;

  const currentFont = FONTS[selectedFont] || FONTS['Pacifico'];
  
  return (
    <Center>
      <Text3D
        font={currentFont}
        size={0.8}
        height={0.3}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.02}
        bevelSize={0.01}
        bevelOffset={0}
        bevelSegments={5}
      >
        {text}
        <meshStandardMaterial 
          color="#333"
          metalness={0.8}
          roughness={0.2}
        />
      </Text3D>
    </Center>
  );
}

// Scene Component
function Scene({ displayText, selectedFont }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <ThreeDText text={displayText} selectedFont={selectedFont} />
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </>
  );
}

// Main App Component
export default function App() {
  const [displayText, setDisplayText] = useState('');
  const [selectedFont, setSelectedFont] = useState('Pacifico');

  const handleInputChange = (e) => {
    setDisplayText(e.target.value);
  };

  const handleFontChange = (e) => {
    setSelectedFont(e.target.value);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Font Selector */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100, background: 'white', padding: '10px', borderRadius: '5px' }}>
        <label>Font: </label>
        <select value={selectedFont} onChange={handleFontChange}>
          {Object.keys(FONTS).map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      {/* Input Field */}
      <div style={{ 
        position: 'absolute', 
        bottom: '20px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        zIndex: 100,
        background: 'black',
        padding: '20px',
        borderRadius: '10px'
      }}>
        <input
          type="text"
          value={displayText}
          onChange={handleInputChange}
          placeholder="Type here to see 3D text..."
          style={{
            padding: '15px',
            fontSize: '18px',
            border: '2px solid #555',
            borderRadius: '8px',
            background: 'white',
            color: 'black',
            minWidth: '400px',
            outline: 'none'
          }}
        />
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} style={{ background: '#eeededff' }}>
        <Environment preset='city'></Environment>
        <Scene displayText={displayText} selectedFont={selectedFont} />
      </Canvas>

      {/* Instructions for custom fonts */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'white', padding: '10px', borderRadius: '5px', maxWidth: '300px', fontSize: '12px' }}>
        <strong>Add Custom Fonts:</strong><br/>
        To use joined/script fonts, add the font URL to the FONTS object. 
        Fonts must be in .typeface.json format (convert at gero3.github.io/facetype.js/)
      </div>
    </div>
  );
}