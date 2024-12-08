import { Canvas } from '@react-three/fiber'
import React, { useEffect, useState } from 'react'
import styles from "@/styles/scrollsection.module.css";
import { Environment, OrbitControls, RoundedBox, Scroll, ScrollControls, Stage } from '@react-three/drei';
import { Classic } from './Classic';
import { Scene } from './Scene';
import { useInView } from 'react-intersection-observer';
import { Euler } from 'three';
import ImageSlider from './ImageSlider';
// import Navbar from './Navbar';

const FadeInElement = ({ children, threshold = 0 }) => {

 
  
    const { ref, inView } = useInView({
      threshold,
      triggerOnce: false,
    });
  
    return (
      <div
        ref={ref}
        style={{
          transform: `translateY(${inView ? 0 : '40px'})`,
          opacity: inView ? 1 : 0,
          transition: 'transform 0.9s ease-out, opacity 0.9s ease-out',
        }}
      >
        {children}
      </div>
    );
  };
  const ScaleElement = ({ children, threshold = 0.05 }) => {
    const { ref, inView } = useInView({
      threshold,
      triggerOnce: false,
    });
  
    return (
      <div
        ref={ref}
        style={{
          transform: `scale(${inView ? 0.64 : 2})`,
          opacity: inView ? 1 : 0,
          transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
        }}
      >
        {children}
      </div>
    );
  };
  const FadeOutElement = ({ children, threshold = 0 }) => {
    const { ref, inView } = useInView({
      threshold,
      triggerOnce: false,
    });
  
    return (
      <div
        ref={ref}
        style={{
          transform: `translateY(${inView ? 0 : '-40px'})`,
          opacity: inView ? 1 : 0,
          transition: 'transform 0.9s ease-out, opacity 0.9s ease-out',
        }}
      >
        {children}
      </div>
    );
  };
const Canvasbox = () => {

  const [pages, setPages] = useState(19.5);
  // Add useEffect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      setPages(window.innerWidth <= 360 ? 21.5 : 19.5);
      
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
   <>
   <div className={styles.canvas}>
   <Canvas>


  
   <ScrollControls pages={pages} damping={.35}>
   <Scene/>



<Scroll html>
    {/* <Navbar/> */}
    <section className={styles.sectionone}>
        <div className={styles.toppart}>
            <FadeInElement>
        <h1 className={styles.intro}>Die zinofresh Box. The box that <span className={styles.lock}>locks.</span></h1>
        </FadeInElement>
        <FadeOutElement>
        
        <p className={styles.introparagraph}>We have created Zino Box GmbH and are now revolutionizing our Pizza Box!</p>
        </FadeOutElement>
        </div>

    </section>

    <FadeOutElement>
    <section className={styles.sectiontwo}>
    <FadeInElement><p className={styles.secondparagraph}>
    The delivery service is booming. More and more people are having their food delivered to their homes. But the old packaging no longer meets the increased demands of modern times! Key word: HYGIENE SAFETY.<br></br> <br></br>Thats why we developed the new Zinofresh boxes. Multiple internationally awarded packaging solutions, specifically designed for professional delivery services. Take-away has never been so innovative.
</p></FadeInElement>

<FadeInElement><button className={styles.cta}>

Request a sample today.</button></FadeInElement>

    </section>
</FadeOutElement>
    
    <section className={styles.zinoclassic}>
        <ScaleElement>
<h1 className={styles.classicboxheader}>zinofresh <span className={styles.cls}>Classic</span> Box</h1>
</ScaleElement>
<FadeInElement>

<h4 className={styles.classicsmallheader}>Opening guarantee thanks to the freshness seal.</h4>
</FadeInElement>
<FadeInElement>

<p className={styles.classicinfo}>
What would you say if you could seal your deliveries with a security lock? This would ensure to every customer that nothing has touched their food and that only they can open the box upon receipt.

Thats because weve developed the Freshness Seal, which is integrated into every Zinofresh box. Thanks to the unique and multiple award-winning locking mechanism, the box is sealed directly at the restaurant.
</p>
</FadeInElement>
<FadeOutElement>
<button className={styles.cta3}>More</button>
</FadeOutElement>
    </section>




  
    <section className={styles.zinosurprise}>
        <ScaleElement>
<h1 className={styles.surpriseboxheader}>zinofresh  <span className={styles.srp}>Surprise</span> Box</h1>
</ScaleElement>
<FadeOutElement>

<h4 className={styles.classicsmallheader2}>The Box Full of Surprises</h4>
</FadeOutElement>


<FadeInElement>
<p className={styles.surpriseinfo}>
We stand for creative design, and the consistent development of the pizza box has led to our second innovation, the ZinoBox 2.0. The first pizza box with an integrated SURPRISE COMPARTMENT<br></br> <br></br>This flagship project is a milestone in the history of the pizza box, combining compelling communication opportunities with food-safe packaging. Added value that benefits pizzerias, advertising companies, and not least, every individual customer. Create truly special moments of surprise...
</p>

</FadeInElement>
<FadeOutElement>
<button className={styles.cta4}>More</button>
</FadeOutElement>

    </section>


    <section className={styles.sectionthree}>
    <div className={styles.goodies}>
<FadeInElement>     <li>Give-aways</li></FadeInElement>
   
<FadeOutElement>     
<li>Gewinnspiele</li></FadeOutElement>
<FadeInElement>  <li>Flyer & Kataloge</li></FadeInElement>
<FadeOutElement>     
<li>Producktproben</li></FadeOutElement>

<FadeInElement>  <li>Vouchers </li></FadeInElement>
      
<FadeOutElement>     
<li> Hospitality Product</li></FadeOutElement> 
     




</div>

<div className={styles.three}>
<FadeInElement><h1 className={styles.products}>Innovations for Take-Away <span>Business </span> 🍕</h1>
<p className={styles.productinfo}>2 packaging solutions that will drive your business forward</p></FadeInElement>
<FadeOutElement>
{/* <div className={styles.cards}>
<div className={styles.card}>Classic</div>
<div className={styles.card2}>Zurprise</div>


</div> */}
<button className={styles.cta5}>Request a sample</button>

</FadeOutElement>
</div>
{/* <p className={styles.cta2details}>Wir vereinen neue Hygienestandards mit packenden Kommunikationsmöglichkeiten in einer lebensmittelechten Verpackung. Verpackungslösungen, die entwickelt wurden um Mehrwerte zu schaffen, von denen Pizzerien, werbende Unternehmen und nicht zuletzt jeder einzelne Endkunde profitieren soll. In Österreich entwickelt und mehrfach international ausgezeichnet! Bestellt heute noch ein Muster und überzeugt Euch selbst von der Innovationskraft, die Dich von der Masse abheben lässt.</p> */}

    </section>


    <section className={styles.sliderr} >
        <FadeInElement>
        <h1 className={styles.greaterinfoheader}>Benefits of the <span>zinofresh</span> Box</h1>        </FadeInElement>
{/* <h4 className={styles.greaterinfosmall}>Innovation trifft Qualität</h4>

<h1 className={styles.greaterinfoheader2}>Preisgekrönte Innovation</h1> */}
  <FadeInElement><h4 className={styles.greaterinfosmall2}>Multiple times internationally awarded</h4></FadeInElement>



<FadeInElement><p className={styles.classicinfo2}>
The result speaks for itself, as Zino Box GmbH has been repeatedly recognized over the years for its innovative packaging solutions.

The World Star Packaging Award is the crowning achievement of these developments. Combined with the highest quality standards, we can look back on many successful partnerships
</p></FadeInElement>




   


  <ImageSlider/>

<div className={styles.footer}>
            <li>Home</li>
            <li>Products</li>
            <li>About Us</li>
            <li>Contact</li>
            <span>All rights reserved 2024@ZinoBox
            Developed By: NUhash</span>
        </div>


    </section>

 
</Scroll>

   </ScrollControls>
   <ambientLight color={'white'} intensity={0.5}/>
   {/* <OrbitControls/> */}
    <Environment files={'/derelict_highway_midday_2k.hdr'} environmentIntensity={.79} environmentRotation={[.42,.84,.2]}></Environment>
   </Canvas>
   </div>
  
   
   
   </>
  )
}

export default Canvasbox