import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Pattern URLs Array
const patternUrls = [
  null, // index 0 - not used
  "https://cdn.shopify.com/s/files/1/0768/3709/3601/files/previewpattern7.svg?v=1753949863",
  "https://cdn.shopify.com/s/files/1/0768/3709/3601/files/previewpattern2.svg?v=1754125376",
  "https://cdn.shopify.com/s/files/1/0768/3709/3601/files/previewpattern1_a2203329-f0e0-4c15-a705-7fcd76f98d31.svg?v=1754125389",
  "https://cdn.shopify.com/s/files/1/0768/3709/3601/files/previewpattern4.svg?v=1754125751",
  "https://cdn.shopify.com/s/files/1/0768/3709/3601/files/previewpattern5.svg?v=1754125751",
  "https://cdn.shopify.com/s/files/1/0768/3709/3601/files/previewpattern6.svg?v=1754125914",
  "https://cdn.shopify.com/s/files/1/0768/3709/3601/files/previewpattern3.svg?v=1754125365",
  // ... continuing with remaining patterns (truncated for brevity)
];

// T-Shirt Model Component
function TShirtModel({ 
  currentColors, 
  currentPattern, 
  overlayTextures, 
  onModelLoad 
}) {
  const { scene } = useGLTF('https://cdn.shopify.com/3d/models/ca04dc61d03f40db/soccerjersey.glb');
  const meshRef = useRef();
  const [currentTexture, setCurrentTexture] = useState(null);

  // Load and modify SVG texture
  const loadActualSVG = useCallback(async (patternNumber) => {
    const svgUrl = patternUrls[patternNumber];
    
    if (!svgUrl) {
      console.warn(`No URL found for pattern ${patternNumber}`);
      return;
    }

    try {
      const response = await fetch(svgUrl);
      const svgText = await response.text();
      const modifiedSVG = modifySVGWithCSS(svgText);
      
      const svgBlob = new Blob([modifiedSVG], {type: 'image/svg+xml'});
      const svgBlobUrl = URL.createObjectURL(svgBlob);
      
      const textureLoader = new THREE.TextureLoader();
      const texture = await new Promise((resolve, reject) => {
        textureLoader.load(svgBlobUrl, resolve, undefined, reject);
      });
      
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.flipY = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      
      setCurrentTexture(texture);
      URL.revokeObjectURL(svgBlobUrl);
    } catch (error) {
      console.error('SVG loading error:', error);
    }
  }, [currentColors]);

  const modifySVGWithCSS = useCallback((svgText) => {
    const cssStyles = `
      <defs>
        <style>
          .varone { fill: ${currentColors.varone} !important; }
          .vartwo { fill: ${currentColors.vartwo} !important; }
          .varthree { fill: ${currentColors.varthree} !important; }
          .varfour { fill: ${currentColors.varfour} !important; }
        </style>
      </defs>
    `;
    
    let modifiedSVG = svgText.replace(/<svg([^>]*)>/, `<svg$1>${cssStyles}`);
    
    // Replace color patterns
    modifiedSVG = modifiedSVG
      .replace(/fill="#B50707"/g, 'class="varone"')
      .replace(/fill="#C80707"/g, 'class="varone"')
      .replace(/fill="#C80101"/g, 'class="varone"')
      .replace(/fill="#FF0000"/g, 'class="varone"')
      .replace(/fill="#114DCF"/g, 'class="vartwo"')
      .replace(/fill="#226CDC"/g, 'class="vartwo"')
      .replace(/fill="white"/g, 'class="varthree"')
      .replace(/fill="#FFFFFF"/g, 'class="varthree"')
      .replace(/fill="#ffffff"/g, 'class="varthree"')
      .replace(/fill="#0E8740"/g, 'class="varfour"')
      .replace(/fill="#031C0D"/g, 'class="varfour"');
    
    return modifiedSVG;
  }, [currentColors]);

  // Update composite texture with overlays
  const updateCompositeTexture = useCallback(() => {
    if (!currentTexture) return;
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 1024;
    
    // Draw base pattern
    if (currentTexture.image) {
      context.drawImage(currentTexture.image, 0, 0, 1024, 1024);
    }
    
    // Layer overlays
    if (overlayTextures.sponsor) {
      const sponsorSize = 120;
      const sponsorX = 265 - sponsorSize/2;
      const sponsorY = 480;
      context.drawImage(overlayTextures.sponsor.image, sponsorX, sponsorY, sponsorSize, sponsorSize);
    }
    
    if (overlayTextures.centerBadge) {
      const badgeSize = 50;
      const badgeX = 230;
      const badgeY = 425;
      context.drawImage(overlayTextures.centerBadge.image, badgeX, badgeY, badgeSize, badgeSize);
    }
    
    if (overlayTextures.rightBadge) {
      const badgeSize = 60;
      const badgeX = 250 - badgeSize/2;
      const badgeY = 200 - badgeSize/2;
      context.drawImage(overlayTextures.rightBadge.image, badgeX, badgeY, badgeSize, badgeSize);
    }
    
    if (overlayTextures.leftBadge) {
      const badgeSize = 60;
      const badgeX = 774 - badgeSize/2;
      const badgeY = 200 - badgeSize/2;
      context.drawImage(overlayTextures.leftBadge.image, badgeX, badgeY, badgeSize, badgeSize);
    }
    
    if (overlayTextures.playerName) {
      const nameWidth = 300;
      const nameHeight = 60;
      const nameX = 755 - nameWidth/2;
      const nameY = 400;
      context.drawImage(overlayTextures.playerName.image, nameX, nameY, nameWidth, nameHeight);
    }
    
    const compositeTexture = new THREE.CanvasTexture(canvas);
    compositeTexture.wrapS = THREE.RepeatWrapping;
    compositeTexture.wrapT = THREE.RepeatWrapping;
    compositeTexture.flipY = false;
    compositeTexture.needsUpdate = true;
    
    // Apply to mesh
    if (meshRef.current) {
      meshRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.map = compositeTexture;
          child.material.needsUpdate = true;
        }
      });
    }
  }, [currentTexture, overlayTextures]);

  useEffect(() => {
    loadActualSVG(currentPattern);
  }, [currentPattern, loadActualSVG]);

  useEffect(() => {
    updateCompositeTexture();
  }, [updateCompositeTexture]);

  useEffect(() => {
    if (onModelLoad) onModelLoad();
  }, [onModelLoad]);

  return (
    <primitive 
      ref={meshRef}
      object={scene} 
      scale={[0.5, 0.5, 0.5]} 
      position={[0, -8, 0]} 
    />
  );
}

// Main Configurator Component
export default function TShirtConfigurator() {
  const [currentColors, setCurrentColors] = useState({
    varone: '#FFFFFF',
    vartwo: '#114DCF', 
    varthree: '#D9D9D9',
    varfour: '#031C0D'
  });
  
  const [currentPattern, setCurrentPattern] = useState(1);
  const [currentSponsor, setCurrentSponsor] = useState(null);
  const [currentBadges, setCurrentBadges] = useState({
    center: false,
    rightsleeve: false,
    leftsleeve: false
  });
  const [selectedSize, setSelectedSize] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [activeTab, setActiveTab] = useState('pattern');
  const [activeColorPart, setActiveColorPart] = useState('varthree');
  const [isLoading, setIsLoading] = useState(true);
  
  const [overlayTextures, setOverlayTextures] = useState({
    sponsor: null,
    centerBadge: null,
    rightBadge: null,
    leftBadge: null,
    playerName: null
  });

  // Handle model load
  const handleModelLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Color handlers
  const handleColorChange = useCallback((color) => {
    setCurrentColors(prev => ({
      ...prev,
      [activeColorPart]: color
    }));
  }, [activeColorPart]);

  // Pattern handlers
  const handlePatternSelect = useCallback((patternNumber) => {
    setCurrentPattern(patternNumber);
  }, []);

  // Size handlers
  const handleSizeSelect = useCallback((size) => {
    setSelectedSize(size);
  }, []);

  // Player name texture creation
  const createPlayerNameTexture = useCallback((name) => {
    if (!name || !selectedSize) {
      setOverlayTextures(prev => ({ ...prev, playerName: null }));
      return;
    }
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = 300;
    canvas.height = 60;
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    const fontSizes = {
      xs: 18, s: 20, m: 22, l: 24, xl: 26, 
      xxl: 28, xxxl: 30, xxxxl: 32, xxxxxl: 34
    };
    
    const fontSize = fontSizes[selectedSize] || 22;
    
    context.font = `bold ${fontSize}px Arial, sans-serif`;
    context.fillStyle = textColor;
    context.strokeStyle = strokeColor;
    context.lineWidth = 2;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    const textX = canvas.width / 2;
    const textY = canvas.height / 2;
    
    context.strokeText(name.toUpperCase(), textX, textY);
    context.fillText(name.toUpperCase(), textX, textY);
    
    const nameTexture = new THREE.CanvasTexture(canvas);
    nameTexture.needsUpdate = true;
    
    setOverlayTextures(prev => ({ ...prev, playerName: nameTexture }));
  }, [selectedSize, textColor, strokeColor]);

  // Badge loading function
  const loadBadge = useCallback((position) => {
    let badgeUrl;
    
    switch(position) {
      case 'center':
        badgeUrl = 'https://cdn.shopify.com/s/files/1/0768/3709/3601/files/Scudetto.svg?v=1754203248';
        break;
      case 'right-sleeve':
        badgeUrl = 'https://cdn.shopify.com/s/files/1/0768/3709/3601/files/italy-national-football-team-seeklogo.png?v=1754160859';
        break;
      case 'left-sleeve':
        badgeUrl = 'https://cdn.shopify.com/s/files/1/0768/3709/3601/files/italy-national-football-team-seeklogo_06543622-1e27-4985-9d5f-ab8cdf694d9b.png?v=1754160880';
        break;
      default:
        return;
    }
    
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      badgeUrl,
      (texture) => {
        // Store in appropriate overlay slot
        if (position === 'center') {
          setOverlayTextures(prev => ({ ...prev, centerBadge: texture }));
        } else if (position === 'right-sleeve') {
          setOverlayTextures(prev => ({ ...prev, rightBadge: texture }));
        } else if (position === 'left-sleeve') {
          setOverlayTextures(prev => ({ ...prev, leftBadge: texture }));
        }
        
        console.log(`Loaded badge for ${position} from Shopify CDN`);
      },
      undefined,
      (error) => {
        console.error('Badge loading error:', error);
        createFallbackBadge(position);
      }
    );
  }, []);

  // Create fallback badge
  const createFallbackBadge = useCallback((position) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = 80;
    canvas.height = 80;
    
    // Create a simple circular badge
    context.fillStyle = '#ff0000';
    context.beginPath();
    context.arc(canvas.width / 2, canvas.height / 2, 35, 0, 2 * Math.PI);
    context.fill();
    
    context.fillStyle = '#ffffff';
    context.font = 'bold 12px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('BADGE', canvas.width / 2, canvas.height / 2);
    
    const fallbackTexture = new THREE.CanvasTexture(canvas);
    
    // Store in appropriate overlay slot
    if (position === 'center') {
      setOverlayTextures(prev => ({ ...prev, centerBadge: fallbackTexture }));
    } else if (position === 'right-sleeve') {
      setOverlayTextures(prev => ({ ...prev, rightBadge: fallbackTexture }));
    } else if (position === 'left-sleeve') {
      setOverlayTextures(prev => ({ ...prev, leftBadge: fallbackTexture }));
    }
  }, []);

  // Sponsor loading function
  const loadSponsorLogo = useCallback((sponsorNumber) => {
    // Create a simple sponsor logo since we don't have the actual sponsor images
    createFallbackSponsorLogo(sponsorNumber);
  }, []);

  // Create fallback sponsor logo
  const createFallbackSponsorLogo = useCallback((sponsorNumber) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = 120;
    canvas.height = 120;
    
    // Create a simple sponsor logo
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.strokeRect(2, 2, canvas.width-4, canvas.height-4);
    
    context.fillStyle = '#000000';
    context.font = 'bold 16px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(`SPONSOR`, canvas.width / 2, canvas.height / 2 - 10);
    context.fillText(`${sponsorNumber}`, canvas.width / 2, canvas.height / 2 + 10);
    
    const fallbackTexture = new THREE.CanvasTexture(canvas);
    setOverlayTextures(prev => ({ ...prev, sponsor: fallbackTexture }));
  }, []);

  // Update player name when dependencies change
  useEffect(() => {
    if (playerName) {
      createPlayerNameTexture(playerName);
    }
  }, [playerName, createPlayerNameTexture]);

  const styles = {
    container: {
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: 'white',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex'
    },
    canvasSection: {
      width: '50vw',
      height: '100vh',
      background: 'whitesmoke',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    configuratorSection: {
      width: '50vw',
      height: '100vh',
      background: 'white',
      borderLeft: '1px solid #e5e5e5',
      display: 'flex',
      flexDirection: 'column'
    },
    loading: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: '#000',
      fontSize: '1rem',
      zIndex: 10
    },
    header: {
      padding: '2rem 2rem 1rem 2rem',
      borderBottom: '1px solid #e5e5e5',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    tabsContainer: {
      display: 'flex',
      gap: '1.5rem',
      flexWrap: 'wrap'
    },
    tab: {
      padding: '0.75rem 0',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#666',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      borderBottom: '2px solid transparent',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem'
    },
    tabActive: {
      color: '#007bff',
      borderBottomColor: '#007bff'
    },
    tabIcon: {
      width: '24px',
      height: '24px',
      opacity: '0.6',
      transition: 'opacity 0.2s ease'
    },
    tabContent: {
      flex: 1,
      padding: '2rem',
      overflowY: 'auto'
    },
    controlGroup: {
      marginBottom: '2rem'
    },
    label: {
      display: 'block',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#000',
      marginBottom: '1rem',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    colorOptions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem'
    },
    colorOption: {
      width: '50px',
      height: '50px',
      borderRadius: '4px',
      border: '2px solid #e5e5e5',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    colorOptionActive: {
      borderColor: '#007bff'
    },
    patternGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '0.5rem',
      maxHeight: '400px',
      overflowY: 'auto'
    },
    patternItem: {
      aspectRatio: '1',
      border: '2px solid #e5e5e5',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#666',
      overflow: 'hidden',
      filter: 'grayscale(100%)'
    },
    patternItemActive: {
      borderColor: '#007bff',
      borderWidth: '3px',
      filter: 'grayscale(0%)'
    },
    colorTabs: {
      display: 'flex',
      gap: '0.75rem',
      marginBottom: '1rem',
      borderBottom: '1px solid #e5e5e5',
      flexWrap: 'wrap'
    },
    colorTab: {
      padding: '0.5rem 0',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#666',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      borderBottom: '2px solid transparent'
    },
    colorTabActive: {
      color: '#007bff',
      borderBottomColor: '#007bff'
    },
    colorPickerContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem',
      padding: '1rem',
      border: '1px solid #e5e5e5',
      borderRadius: '8px',
      background: '#f9f9f9'
    },
    colorPicker: {
      width: '50px',
      height: '50px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      background: 'none'
    },
    colorPreview: {
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      border: '2px solid #e5e5e5'
    },
    colorHex: {
      fontFamily: "'Courier New', monospace",
      fontSize: '0.875rem',
      color: '#666',
      minWidth: '70px'
    },
    sizeOptions: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap',
      justifyContent: 'flex-start'
    },
    sizeOption: {
      padding: '0.75rem 1rem',
      border: '1px solid #e5e5e5',
      background: 'white',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      minWidth: '55px',
      textAlign: 'center',
      fontSize: '0.875rem',
      flex: '0 0 auto',
      whiteSpace: 'nowrap'
    },
    sizeOptionActive: {
      borderColor: '#007bff',
      background: '#007bff',
      color: 'white'
    },
    inputField: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #e5e5e5',
      borderRadius: '4px',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease'
    },
    inputFieldDisabled: {
      backgroundColor: '#f5f5f5',
      color: '#999',
      cursor: 'not-allowed'
    },
    disabledMessage: {
      fontSize: '0.75rem',
      color: '#999',
      marginTop: '0.5rem',
      fontStyle: 'italic'
    },
    viewControls: {
      position: 'absolute',
      bottom: '1rem',
      left: '1rem',
      color: '#666',
      fontSize: '0.75rem'
    },
    badgeOptions: {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, 1fr)',
      gap: '1rem'
    },
    badgeOption: {
      padding: '1rem',
      border: '1px solid #e5e5e5',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'center',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    badgeOptionActive: {
      borderColor: '#007bff',
      background: '#f0f8ff'
    },
    sponsorGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
      maxHeight: '400px',
      overflowY: 'auto'
    },
    sponsorItem: {
      aspectRatio: '1',
      border: '2px solid #e5e5e5',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#666',
      overflow: 'hidden',
      filter: 'grayscale(100%)'
    },
    sponsorItemActive: {
      borderColor: '#007bff',
      borderWidth: '3px',
      filter: 'grayscale(0%)'
    },
    textStyleControls: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginBottom: '1rem'
    },
    textStyleGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    cartIcon: {
      width: '24px',
      height: '24px',
      cursor: 'pointer',
      stroke: '#000',
      transition: 'all 0.2s ease'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.canvasSection}>
        {isLoading && (
          <div style={styles.loading}>
            Caricamento Modello 3D...
          </div>
        )}
        <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
          <color attach="background" args={['#f5f5f5']} />
  <Environment preset='city'/>
          <TShirtModel 
            currentColors={currentColors}
            currentPattern={currentPattern}
            overlayTextures={overlayTextures}
            onModelLoad={handleModelLoad}
          />
          <OrbitControls 
            enableDamping
            dampingFactor={0.05}
            enableZoom
            enablePan={false}
            minDistance={10}
            maxDistance={25}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Canvas>
        <div style={styles.viewControls}>
          Clicca e trascina per ruotare • Scorri per ingrandire
        </div>
      </div>
      
      <div style={styles.configuratorSection}>
        <div style={styles.header}>
          <div style={styles.tabsContainer}>
            {[
              { id: 'pattern', label: 'Motivo', icon: 'M12 2L2 7l10 5 10-5-10-5z M2 17 10 5 10-5 M2 12 10 5 10-5' },
              { id: 'color', label: 'Colore', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10' },
              { id: 'sponsor', label: 'Sponsor', icon: 'M2 3h20v14H2V3z M8 21h8 M12 17v4' },
              { id: 'badge', label: 'Distintivo', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
              { id: 'size', label: 'Taglia', icon: 'M15 3h6v6 M9 21H3v-6 M21 3l-7 7 M3 21l7-7' },
              { id: 'name', label: 'Nome', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H9H8' }
            ].map(tab => (
              <div 
                key={tab.id}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.id ? styles.tabActive : {})
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                <svg 
                  style={styles.tabIcon} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d={tab.icon} />
                </svg>
                {tab.label}
              </div>
            ))}
          </div>
          
          <svg style={styles.cartIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="m1 1 4 4 2 10 11 0 3-7H6"></path>
          </svg>
        </div>
        
        <div style={styles.tabContent}>
          {/* Pattern Panel */}
          {activeTab === 'pattern' && (
            <div style={styles.controlGroup}>
              <label style={styles.label}>Seleziona Motivo</label>
              <div style={styles.patternGrid}>
                {Array.from({length: 71}, (_, i) => i + 1).map(patternNum => {
                  const imageNumber = patternNum === 1 ? 7 : patternNum === 7 ? 1 : patternNum;
                  const imageUrl = `https://cdn.shopify.com/s/files/1/0768/3709/3601/files/pattern${imageNumber}.png?v=1754159726`;
                  
                  return (
                    <div
                      key={patternNum}
                      style={{
                        ...styles.patternItem,
                        backgroundImage: `url('${imageUrl}')`,
                        ...(currentPattern === patternNum ? styles.patternItemActive : {})
                      }}
                      onClick={() => handlePatternSelect(patternNum)}
                    >
                      <span style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        background: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        {patternNum}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Panel */}
          {activeTab === 'color' && (
            <>
              <div style={styles.colorTabs}>
                {[
                  { id: 'varthree', label: 'Texture Maglia 1' },
                  { id: 'vartwo', label: 'Texture Maglia 2' },
                  { id: 'varone', label: 'Texture Maglia 3' },
                  { id: 'varfour', label: 'Texture Maniche' }
                ].map(tab => (
                  <div
                    key={tab.id}
                    style={{
                      ...styles.colorTab,
                      ...(activeColorPart === tab.id ? styles.colorTabActive : {})
                    }}
                    onClick={() => setActiveColorPart(tab.id)}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>
              
              <div style={styles.controlGroup}>
                <label style={styles.label}>
                  {activeColorPart === 'varthree' ? 'Texture Maglia 1' :
                   activeColorPart === 'vartwo' ? 'Texture Maglia 2' :
                   activeColorPart === 'varone' ? 'Texture Maglia 3' : 'Texture Maniche'}
                </label>
                
                <div style={styles.colorPickerContainer}>
                  <input
                    type="color"
                    style={styles.colorPicker}
                    value={currentColors[activeColorPart]}
                    onChange={(e) => handleColorChange(e.target.value)}
                  />
                  <div
                    style={{
                      ...styles.colorPreview,
                      backgroundColor: currentColors[activeColorPart],
                      borderColor: currentColors[activeColorPart] === '#FFFFFF' ? '#ccc' : '#e5e5e5'
                    }}
                  />
                  <span style={styles.colorHex}>
                    {currentColors[activeColorPart].toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <label style={{...styles.label, fontSize: '0.75rem', marginBottom: '0.5rem'}}>
                    Colori Rapidi
                  </label>
                  <div style={styles.colorOptions}>
                    {[
                      '#FFFFFF', '#000000', '#ff0000', '#00ff00',
                      '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
                      '#808080', '#800000', '#008000', '#D9D9D9'
                    ].map(color => (
                      <div
                        key={color}
                        style={{
                          ...styles.colorOption,
                          backgroundColor: color,
                          ...(currentColors[activeColorPart] === color ? styles.colorOptionActive : {})
                        }}
                        onClick={() => handleColorChange(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Sponsor Panel */}
          {activeTab === 'sponsor' && (
            <div style={styles.controlGroup}>
              <label style={styles.label}>Logo Sponsor</label>
              <div style={styles.sponsorGrid}>
                {Array.from({length: 12}, (_, i) => i + 1).map(sponsorNum => (
                  <div
                    key={sponsorNum}
                    style={{
                      ...styles.sponsorItem,
                      ...(currentSponsor === sponsorNum ? styles.sponsorItemActive : {})
                    }}
                    onClick={() => {
                      if (currentSponsor === sponsorNum) {
                        setCurrentSponsor(null);
                        setOverlayTextures(prev => ({ ...prev, sponsor: null }));
                      } else {
                        setCurrentSponsor(sponsorNum);
                        loadSponsorLogo(sponsorNum);
                      }
                    }}
                  >
                    <span style={{textAlign: 'center', color: '#666', fontSize: '0.7rem', fontWeight: '500'}}>
                      Logo {sponsorNum}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badge Panel */}
          {activeTab === 'badge' && (
            <div style={styles.controlGroup}>
              <label style={styles.label}>Posizionamento Distintivo</label>
              <div style={styles.badgeOptions}>
                {[
                  { id: 'right-sleeve', label: 'Manica Destra' },
                  { id: 'center', label: 'Distintivo Centrale' },
                  { id: 'left-sleeve', label: 'Manica Sinistra' }
                ].map(badge => (
                  <div
                    key={badge.id}
                    style={{
                      ...styles.badgeOption,
                      ...(currentBadges[badge.id === 'right-sleeve' ? 'rightsleeve' : 
                                      badge.id === 'left-sleeve' ? 'leftsleeve' : 
                                      badge.id] ? styles.badgeOptionActive : {})
                    }}
                    onClick={() => {
                      const badgeKey = badge.id === 'right-sleeve' ? 'rightsleeve' : 
                                     badge.id === 'left-sleeve' ? 'leftsleeve' : 
                                     badge.id;
                      const isCurrentlyActive = currentBadges[badgeKey];
                      
                      if (isCurrentlyActive) {
                        // Remove badge
                        setCurrentBadges(prev => ({
                          ...prev,
                          [badgeKey]: false
                        }));
                        
                        // Remove badge texture
                        if (badge.id === 'center') {
                          setOverlayTextures(prev => ({ ...prev, centerBadge: null }));
                        } else if (badge.id === 'right-sleeve') {
                          setOverlayTextures(prev => ({ ...prev, rightBadge: null }));
                        } else if (badge.id === 'left-sleeve') {
                          setOverlayTextures(prev => ({ ...prev, leftBadge: null }));
                        }
                      } else {
                        // Add badge
                        setCurrentBadges(prev => ({
                          ...prev,
                          [badgeKey]: true
                        }));
                        
                        // Load badge
                        loadBadge(badge.id);
                      }
                    }}
                  >
                    {badge.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Size Panel */}
          {activeTab === 'size' && (
            <div style={styles.controlGroup}>
              <label style={styles.label}>Taglia</label>
              <div style={styles.sizeOptions}>
                {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL', 'XXXXXL'].map(size => (
                  <div
                    key={size}
                    style={{
                      ...styles.sizeOption,
                      ...(selectedSize === size.toLowerCase() ? styles.sizeOptionActive : {})
                    }}
                    onClick={() => handleSizeSelect(size.toLowerCase())}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Name Panel */}
          {activeTab === 'name' && (
            <>
              <div style={styles.controlGroup}>
                <label style={styles.label}>Nome Giocatore</label>
                <input
                  type="text"
                  style={{
                    ...styles.inputField,
                    ...(selectedSize ? {} : styles.inputFieldDisabled)
                  }}
                  placeholder="Inserisci nome giocatore"
                  disabled={!selectedSize}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
                <div style={styles.disabledMessage}>
                  {selectedSize ? 'Inserisci il nome del giocatore per il retro della maglia' : 'Seleziona prima una taglia'}
                </div>
              </div>
              
              <div style={styles.controlGroup}>
                <label style={styles.label}>Stile Testo</label>
                <div style={styles.textStyleControls}>
                  <div style={styles.textStyleGroup}>
                    <label style={{...styles.label, fontSize: '0.7rem', marginBottom: '0.25rem'}}>
                      Colore Testo
                    </label>
                    <div style={styles.colorPickerContainer}>
                      <input
                        type="color"
                        style={styles.colorPicker}
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                      />
                      <div
                        style={{
                          ...styles.colorPreview,
                          backgroundColor: textColor,
                          borderColor: textColor === '#FFFFFF' ? '#ccc' : '#e5e5e5'
                        }}
                      />
                      <span style={styles.colorHex}>{textColor.toUpperCase()}</span>
                    </div>
                  </div>
                  <div style={styles.textStyleGroup}>
                    <label style={{...styles.label, fontSize: '0.7rem', marginBottom: '0.25rem'}}>
                      Colore Contorno
                    </label>
                    <div style={styles.colorPickerContainer}>
                      <input
                        type="color"
                        style={styles.colorPicker}
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                      />
                      <div
                        style={{
                          ...styles.colorPreview,
                          backgroundColor: strokeColor
                        }}
                      />
                      <span style={styles.colorHex}>{strokeColor.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}