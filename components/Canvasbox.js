import { Canvas } from '@react-three/fiber'
import React, { useEffect, useState } from 'react'
import styles from "@/styles/scrollsection.module.css";
import { Environment, OrbitControls, RoundedBox, Scroll, ScrollControls, Stage } from '@react-three/drei';
import { Classic } from './Classic';
import { Scene } from './Scene';
import { useInView } from 'react-intersection-observer';
import { Euler } from 'three';
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
      setPages(window.innerWidth > 321 ? 22 : 19.5);
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
        
        <p className={styles.introparagraph}>Wir sind die zino box GmbH und  haben mal eben die Pizza Box für dich revolutioniert!</p>
        </FadeOutElement>
        </div>

    </section>

    <FadeOutElement>
    <section className={styles.sectiontwo}>
    <FadeInElement><p className={styles.secondparagraph}>
Der Lieferservice boomt. Immer mehr Menschen lassen ihr Essen nach Hause bringen. Aber die alten Verpackungen werden den gestiegenen Anforderungen der modernen Zeit nicht mehr gerecht! Stichwort: HYGIENESICHERHEIT.<br></br> <br></br>Deswegen haben wir die neuen zinofresh Boxen entwickelt. Mehrfach international preisgekrönte Verpackungslösungen, speziell für den professionellen Lieferdienst entwickelt. Take-Away war noch nie so innovativ.
</p></FadeInElement>

<FadeInElement><button className={styles.cta}>
Heute noch ein Muster anfordern</button></FadeInElement>

    </section>
</FadeOutElement>
    
    <section className={styles.zinoclassic}>
        <ScaleElement>
<h1 className={styles.classicboxheader}>zinofresh <span className={styles.cls}>Classic</span> Box</h1>
</ScaleElement>
<FadeInElement>

<h4 className={styles.classicsmallheader}>Erstöffnungsgarantie dank des Frische Siegels</h4>
</FadeInElement>
<FadeInElement>

<p className={styles.classicinfo}>
Was würdest du sagen, wenn du deine Auslieferungen mit einem Sicherheitsschloss versiegeln könntest? Dabei versicherst du jedem Kunden, dass nichts an seine Speisen kommen konnte, und dass nur sie die Box nach Erhalt öffnen können.

Denn wir haben den Frische Siegel entwickelt, der auf jeder zinofresh Box integriert ist. Dank des einzigartigen und mehrfach ausgezeichneten Schliessmechanismus, wird die Box vor Ort im Restaurant verschlossen.
</p>
</FadeInElement>
<FadeOutElement>
<button className={styles.cta3}>Mehr</button>
</FadeOutElement>
    </section>




  
    <section className={styles.zinosurprise}>
        <ScaleElement>
<h1 className={styles.surpriseboxheader}>zinofresh  <span className={styles.srp}>Surprise</span> Box</h1>
</ScaleElement>
<FadeOutElement>

<h4 className={styles.classicsmallheader2}>Die Box voller Übrraschungen</h4>
</FadeOutElement>


<FadeInElement>
<p className={styles.surpriseinfo}>
Wir stehen für kreatives Design und die konsequente Weiterentwicklung der Pizzabox hat zu unserer zweiten Innovation der ZinoBox 2.0 geführt. Die erste Pizza Box mit integriertem SURPRISE FACH.. <br></br> <br></br> Dieses Vorzeigeprojekt ist ein Meilenstein in der Geschichte der Pizzaschachtel und vereint packende Kommunikationsmöglichkeiten mit einer lebensmittelechten Verpackung. Mehrwerte, von denen Pizzerien, werbende Unternehmen und nicht zuletzt jeder einzelne Endkunde profitiert. Sorgen Sie für ganz besondere Überraschungsmomente …
</p>

</FadeInElement>
<FadeOutElement>
<button className={styles.cta4}>Mehr</button>
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

<FadeInElement>  <li>Gutscheine</li></FadeInElement>
      
<FadeOutElement>     
<li> Gastro-Artikel</li></FadeOutElement> 
     




</div>

<div className={styles.three}>
<FadeInElement><h1 className={styles.products}>Innovationen für das Take-Away <span>Business </span> 🍕</h1>
<p className={styles.productinfo}>2 Verpackungslösungen, die Dein Geschäft voranbringen</p></FadeInElement>
<FadeOutElement>
{/* <div className={styles.cards}>
<div className={styles.card}>Classic</div>
<div className={styles.card2}>Zurprise</div>


</div> */}
<button className={styles.cta5}>Muster anfordern</button>

</FadeOutElement>
</div>
{/* <p className={styles.cta2details}>Wir vereinen neue Hygienestandards mit packenden Kommunikationsmöglichkeiten in einer lebensmittelechten Verpackung. Verpackungslösungen, die entwickelt wurden um Mehrwerte zu schaffen, von denen Pizzerien, werbende Unternehmen und nicht zuletzt jeder einzelne Endkunde profitieren soll. In Österreich entwickelt und mehrfach international ausgezeichnet! Bestellt heute noch ein Muster und überzeugt Euch selbst von der Innovationskraft, die Dich von der Masse abheben lässt.</p> */}

    </section>


    <section className={styles.sliderr} >
        <FadeInElement>
        <h1 className={styles.greaterinfoheader}>Vorteile der <span>zinofresh</span> Box</h1>        </FadeInElement>
{/* <h4 className={styles.greaterinfosmall}>Innovation trifft Qualität</h4>

<h1 className={styles.greaterinfoheader2}>Preisgekrönte Innovation</h1> */}
  <FadeInElement><h4 className={styles.greaterinfosmall2}>Mehrfach international ausgezeichnet</h4></FadeInElement>



<FadeInElement><p className={styles.classicinfo2}>
Das Resultat kann sich sehen lassen, denn die zino box GmbH ist über die Jahre mehrfach für seine innovativen Verpackungslösungen ausgezeichnet worden.

Der World Star Packaging Award ist die Krönung dieser Entwicklungen. Gepaart mit den höchsten Qualitätsstandards können wir auf viele erfolgreiche Partnerschaften zurückblicken.
</p></FadeInElement>




   

<div className={styles.sld}></div>
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
   <ambientLight color={'white'} intensity={1.0}/>
   {/* <OrbitControls/> */}
    <Environment files={"/derelict_highway_midday_2k.hdr"} environmentIntensity={1.04} environmentRotation={[.92,.84,.2]}></Environment>
   </Canvas>
   </div>
  
   
   
   </>
  )
}

export default Canvasbox