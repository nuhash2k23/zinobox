import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
    Environment, 
    OrbitControls, 
    useGLTF, 
    PerspectiveCamera,
    Html,
    Billboard,
    Text
} from '@react-three/drei';
import * as THREE from 'three';
import { Vector3, MathUtils } from 'three';
import Image from 'next/image';

// Utility function for camera transitions
const lerp = (start, end, factor) => {
    return start + (end - start) * factor;
};

// Hotspot Component
const Hotspot = ({ position, onClick, label, selected }) => {
    const { camera } = useThree();
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <Billboard
            follow={true}
            lockX={false}
            lockY={false}
            lockZ={false}
        >
            <Html distanceFactor={10}>
                <div
                    onClick={onClick}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        background: selected ? '#4CAF50' : isHovered ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)',
                        padding: '8px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.3s ease',
                        color: selected ? 'white' : 'black',
                        fontWeight: 'bold'
                    }}
                >
                    {label}
                </div>
            </Html>
        </Billboard>
    );
};

// Info Popup Component
const InfoPopup = ({ info, onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 0 20px rgba(0,0,0,0.2)',
            zIndex: 1000,
            maxWidth: '500px',
            width: '90%'
        }}>
            <button 
                onClick={onClose}
                style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: '#666'
                }}
            >
                ✕
            </button>
            {info.image && (
                <Image 
                    src={info.image} 
                    alt={info.title} 
                    style={{ 
                        maxWidth: '100%', 
                        height: 'auto',
                        marginBottom: '15px',
                        borderRadius: '5px'
                    }} 
                />
            )}
            <h3 style={{ margin: '0 0 10px 0' }}>{info.title}</h3>
            <p style={{ margin: '0', lineHeight: '1.5' }}>{info.description}</p>
        </div>
    );
};

// Camera Controls Component
const CameraControls = ({ mode, setMode }) => {
    return (
        <div style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.7)',
            padding: '10px',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 100
        }}>
            {['orbit', 'pan', 'zoom'].map((controlMode) => (
                <button 
                    key={controlMode}
                    onClick={() => setMode(controlMode)}
                    style={{
                        background: mode === controlMode ? '#4CAF50' : '#fff',
                        padding: '10px 15px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        color: mode === controlMode ? 'white' : 'black',
                        fontWeight: mode === controlMode ? 'bold' : 'normal',
                        transition: 'all 0.3s ease',
                        textTransform: 'capitalize'
                    }}
                >
                    {controlMode}
                </button>
            ))}
        </div>
    );
};

// Layers Panel Component
const LayersPanel = ({ layers, toggleLayer, resetCamera }) => {
    return (
        <div style={{
            position: 'absolute',
            right: '20px',
            top: '20px',
            background: 'rgba(0,0,0,0.7)',
            padding: '20px',
            borderRadius: '10px',
            color: 'white',
            maxHeight: '80vh',
            overflowY: 'auto',
            zIndex: 100
        }}>
            <button 
                onClick={resetCamera}
                style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '20px',
                    background: '#4CAF50',
                    border: 'none',
                    borderRadius: '5px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease'
                }}
            >
                Reset View
            </button>
            <h3 style={{ margin: '0 0 15px 0' }}>Layers</h3>
            {layers.map(layer => (
                <div key={layer.id} style={{
                    padding: '10px',
                    borderBottom: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <input 
                        type="checkbox" 
                        checked={layer.visible}
                        onChange={() => toggleLayer(layer.id)}
                    />
                    {layer.name}
                </div>
            ))}
        </div>
    );
};