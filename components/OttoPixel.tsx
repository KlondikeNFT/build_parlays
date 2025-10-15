'use client';

import { useEffect } from 'react';

export default function OTTOPixel() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if script already exists
    if (document.getElementById('sa-dynamic-optimization-loader')) return;

    // Create the standard SearchAtlas OTTO script
    const script = document.createElement('script');
    script.id = 'sa-dynamic-optimization-loader';
    script.src = 'https://dashboard.searchatlas.com/scripts/dynamic_optimization.js';
    script.setAttribute('data-uuid', 'dbb69606-524e-4692-9374-e1d7a2f1ad16');
    script.async = true;
    
    // Add to head
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const existingScript = document.getElementById('sa-dynamic-optimization-loader');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
