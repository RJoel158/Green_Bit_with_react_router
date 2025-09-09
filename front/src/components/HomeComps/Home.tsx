import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Stats from "./Stats";
import Services from "./Services";
import CTA from "./CTA";
import Footer from "./Footer";

export default function Home(){
  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Services />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
