import { Canvas } from '@react-three/fiber'
import React from 'react'
import styles from "@/styles/scrollsection.module.css";
import { Environment, OrbitControls, RoundedBox, Scroll, ScrollControls, Stage } from '@react-three/drei';
import { Classic } from './Classic';
import { Scene } from './Scene';
// import Navbar from './Navbar';
const Canvasbox = () => {
  return (
   <>
   <div className={styles.canvas}>
   <Canvas>


  
   <ScrollControls pages={12} damping={.3}>
   <Scene/>



<Scroll html>
    {/* <Navbar/> */}
    <section className={styles.sectionone}>
        <div className={styles.toppart}>
        <h1 className={styles.intro}>Die zinofresh Box. The box that <span className={styles.lock}>locks.</span></h1>
        <p className={styles.introparagraph}>Wir sind die zino box GmbH und  haben mal eben die Pizza Box für dich revolutioniert!</p>
        </div>

    </section>


    <section className={styles.sectiontwo}>
<p className={styles.secondparagraph}>
Der Lieferservice boomt. Immer mehr Menschen lassen ihr Essen nach Hause bringen. Aber die alten Verpackungen werden den gestiegenen Anforderungen der modernen Zeit nicht mehr gerecht! Stichwort: HYGIENESICHERHEIT. Deswegen haben wir die neuen zinofresh Boxen entwickelt. Mehrfach international preisgekrönte Verpackungslösungen, speziell für den professionellen Lieferdienst entwickelt. Take-Away war noch nie so innovativ.
</p>
<button className={styles.cta}>
Heute noch ein Muster anfordern</button>
    </section>

    
    <section className={styles.zinoclassic}>
<h1 className={styles.classicboxheader}>zinofresh <span className={styles.cls}>Classic</span> Box</h1>
<h4 className={styles.classicsmallheader}>Erstöffnungsgarantie dank des Frische Siegels</h4>
<p className={styles.classicinfo}>
Was würdest du sagen, wenn du deine Auslieferungen mit einem Sicherheitsschloss versiegeln könntest? Dabei versicherst du jedem Kunden, dass nichts an seine Speisen kommen konnte, und dass nur sie die Box nach Erhalt öffnen können.

Denn wir haben den Frische Siegel entwickelt, der auf jeder zinofresh Box integriert ist. Dank des einzigartigen und mehrfach ausgezeichneten Schliessmechanismus, wird die Box vor Ort im Restaurant verschlossen.
</p>
<button className={styles.cta3}>Mehr</button>
    </section>




  
    <section className={styles.zinosurprise}>
<h1 className={styles.surpriseboxheader}>zinofresh  <span className={styles.srp}>Surprise</span> Box</h1>
<h4 className={styles.classicsmallheader2}>Die Box voller Übrraschungen</h4>


<p className={styles.surpriseinfo}>
Wir stehen für kreatives Design und die konsequente Weiterentwicklung der Pizzabox hat zu unserer zweiten Innovation der ZinoBox 2.0 geführt. Die erste Pizza Box mit integriertem SURPRISE FACH. Dieses Vorzeigeprojekt ist ein Meilenstein in der Geschichte der Pizzaschachtel und vereint packende Kommunikationsmöglichkeiten mit einer lebensmittelechten Verpackung. Mehrwerte, von denen Pizzerien, werbende Unternehmen und nicht zuletzt jeder einzelne Endkunde profitiert. Sorgen Sie für ganz besondere Überraschungsmomente …
</p>

<button className={styles.cta4}>Mehr</button>
    </section>


    <section className={styles.sectionthree}>
    <div className={styles.goodies}>

        <li>Give-aways</li>

<li>Gewinnspiele</li>
        <li>Flyer & Kataloge</li>
        <li>Producktproben</li>
        <li>Gutscheine</li>
        <li>
        Gastro-Artikel</li>




</div>
<div className={styles.three}>
<h1 className={styles.products}>Innovationen für das Take-Away Business</h1>
<p className={styles.productinfo}>2 Verpackungslösungen, die Dein Geschäft voranbringen</p>
<div className={styles.cards}>
<div className={styles.card}>A</div>
<div className={styles.card2}>A</div>

</div>
<button className={styles.cta5}>Muster anfordern</button>
</div>
{/* <p className={styles.cta2details}>Wir vereinen neue Hygienestandards mit packenden Kommunikationsmöglichkeiten in einer lebensmittelechten Verpackung. Verpackungslösungen, die entwickelt wurden um Mehrwerte zu schaffen, von denen Pizzerien, werbende Unternehmen und nicht zuletzt jeder einzelne Endkunde profitieren soll. In Österreich entwickelt und mehrfach international ausgezeichnet! Bestellt heute noch ein Muster und überzeugt Euch selbst von der Innovationskraft, die Dich von der Masse abheben lässt.</p> */}

    </section>


    <section className={styles.sliderr} >
    <h1 className={styles.greaterinfoheader}>Vorteile der zinofresh Box</h1>
{/* <h4 className={styles.greaterinfosmall}>Innovation trifft Qualität</h4>
<h1 className={styles.greaterinfoheader2}>Preisgekrönte Innovation</h1> */}
<h4 className={styles.greaterinfosmall2}>Mehrfach international ausgezeichnet</h4>



<p className={styles.classicinfo2}>
Das Resultat kann sich sehen lassen, denn die zino box GmbH ist über die Jahre mehrfach für seine innovativen Verpackungslösungen ausgezeichnet worden.

Der World Star Packaging Award ist die Krönung dieser Entwicklungen. Gepaart mit den höchsten Qualitätsstandards können wir auf viele erfolgreiche Partnerschaften zurückblicken.
</p>


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
   {/* <OrbitControls/> */}
    <Environment preset='studio' environmentIntensity={.32}></Environment>
   </Canvas>
   </div>
  
   
   
   </>
  )
}

export default Canvasbox