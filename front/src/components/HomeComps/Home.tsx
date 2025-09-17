import React, { useEffect } from 'react';
import Navbar from "./Navbar";
import Hero from "./Hero";
import Stats from "./Stats";
import Services from "./Services";
import CTA from "./CTA";
import Footer from "./Footer";
import "../HomeComps/Home.css";

export default function Home() {
  useEffect(() => {
    // Add smooth scrolling behavior
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = (link as HTMLAnchorElement).getAttribute('href')?.slice(1);
        if (targetId) {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });

    // Add intersection observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.loading-animation');
    animatedElements.forEach(el => observer.observe(el));

    // Cleanup
    return () => {
      smoothScrollLinks.forEach(link => {
        link.removeEventListener('click', () => {});
      });
      observer.disconnect();
    };
  }, []);

  return (
    <div className="position-relative">
      {/* Navigation */}
      <Navbar />
      
      {/* Main Content */}
      <main className="overflow-hidden">
        <Hero />
        <Stats />
        <Services />
        <CTA />
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Back to top button */}
      <button
        className="btn btn-success position-fixed bottom-0 end-0 m-4 rounded-circle"
        style={{
          width: '50px',
          height: '50px',
          zIndex: 1000,
          opacity: 0,
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(74, 124, 89, 0.3)'
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onLoad={(e) => {
          // Show button when scrolled down
          window.addEventListener('scroll', () => {
            const button = e.target as HTMLElement;
            if (window.scrollY > 300) {
              button.style.opacity = '1';
              button.style.transform = 'translateY(0)';
            } else {
              button.style.opacity = '0';
              button.style.transform = 'translateY(10px)';
            }
          });
        }}
      >
        <i className="bi bi-arrow-up"></i>
      </button>
    </div>
  );
}