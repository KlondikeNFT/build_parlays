const fs = require('fs');
const path = require('path');

const files = [
  'app/guides/parlay-calculator-futures/page.tsx',
  'app/guides/parlay-calculator-live-nfl/page.tsx',
  'app/guides/parlay-calculator-odds-boosts/page.tsx',
  'app/guides/parlay-calculator-round-robin/page.tsx',
  'app/guides/parlay-calculator-same-game/page.tsx'
];

files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Split content into metadata and JSX sections
    const metadataEndIndex = content.indexOf('export default function');
    const metadata = content.substring(0, metadataEndIndex);
    const jsx = content.substring(metadataEndIndex);
    
    // Fix JSX content by escaping quotes and apostrophes
    const fixedJsx = jsx
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
    
    // Combine back
    const fixedContent = metadata + fixedJsx;
    
    fs.writeFileSync(filePath, fixedContent);
    console.log(`Fixed ${filePath}`);
  }
});

console.log('All files fixed!');
