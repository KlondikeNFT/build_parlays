'use client';

import { useEffect } from 'react';

// Extend Window interface for SearchAtlas OTTO
declare global {
  interface Window {
    OTTO?: any;
    OTTOObject?: any;
  }
}

export default function OttoPixel() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if OTTO already exists
    if (window.OTTO || document.getElementById('searchatlas-otto')) return;

    // Create the proper SearchAtlas OTTO script
    const script = document.createElement('script');
    script.id = 'searchatlas-otto';
    script.innerHTML = `
      (function(w, d, s, o, f, js, fjs) {
        w['OTTOObject'] = o;
        w[o] = w[o] || function() {
          (w[o].q = w[o].q || []).push(arguments)
        }, w[o].l = 1 * new Date();
        js = d.createElement(s),
        fjs = d.getElementsByTagName(s)[0];
        js.async = 1;
        js.src = f;
        fjs.parentNode.insertBefore(js, fjs);
      })(window, document, 'script', 'OTTO', 'https://cdn.searchatlas.com/otto.js');
      OTTO('init', 'dbb69606-524e-4692-9374-e1d7a2f1ad16');
    `;
    
    // Add to head
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const existingScript = document.getElementById('searchatlas-otto');
      if (existingScript) {
        existingScript.remove();
      }
      // Clean up OTTO object
      if (window.OTTO) {
        delete window.OTTO;
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
