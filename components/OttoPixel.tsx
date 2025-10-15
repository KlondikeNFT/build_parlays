'use client';

import { useEffect } from 'react';

export default function OttoPixel() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if script already exists
    if (document.getElementById('sa-dynamic-optimization')) return;

    // Create and inject the SearchAtlas OTTO pixel script
    const script = document.createElement('script');
    script.setAttribute('nowprocket', '');
    script.setAttribute('nitro-exclude', '');
    script.type = 'text/javascript';
    script.id = 'sa-dynamic-optimization';
    script.setAttribute('data-uuid', 'dbb69606-524e-4692-9374-e1d7a2f1ad16');
    script.src = 'data:text/javascript;base64,dmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoInNjcmlwdCIpO3NjcmlwdC5zZXRBdHRyaWJ1dGUoIm5vd3Byb2NrZXQiLCAiIik7c2NyaXB0LnNldEF0dHJpYnV0ZSgibml0cm8tZXhjbHVkZSIsICIiKTtzY3JpcHQuc3JjID0gImh0dHBzOi8vZGFzaGJvYXJkLnNlYXJjaGF0bGFzLmNvbS9zY3JpcHRzL2R5bmFtaWNfb3B0aW1pemF0aW9uLmpzIjtzY3JpcHQuZGF0YXNldC51dWlkID0gImRiYjY5NjA2LTUyNGUtNDY5Mi05Mzc0LWUxZDdhMmYxYWQxNiI7c2NyaXB0LmlkID0gInNhLWR5bmFtaWMtb3B0aW1pemF0aW9uLWxvYWRlciI7ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpOw==';
    
    // Add to head
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const existingScript = document.getElementById('sa-dynamic-optimization');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
