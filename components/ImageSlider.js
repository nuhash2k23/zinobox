import React, { useState, useEffect, useRef } from 'react';
import styles from "@/styles/scrollsection.module.css";

const ImageSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    


    const images = [
        '/1.jpg',
        '/2.jpg',
        '/3.jpg',
        '/4.jpg',
        '/5.jpg'
    ];

    // Minimum swipe distance (in px)
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => 
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }, 3000); // Change slide every 3 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.sliderContainer}>
            <div 
                className={styles.sliderTrack} 
                style={{ 
                    transform: `translateX(-${currentIndex * 100}%)`
                }}
            >
                {images.map((image, index) => (
                    <div key={index} className={styles.slide}>
                        <img 
                            src={image} 
                            alt={`Award ${index + 1}`} 
                            className={styles.slideImage}
                        />
                    </div>
                ))}
            </div>
            <div className={styles.indicators}>
                {images.map((_, index) => (
                    <div 
                        key={index}
                        className={`${styles.indicator} ${
                            currentIndex === index ? styles.activeIndicator : ''
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ImageSlider;