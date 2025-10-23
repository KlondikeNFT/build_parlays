const fs = require('fs');
const path = require('path');

async function scrapeCompleteNFLSchedule() {
  console.log('🏈 Scraping complete NFL 2025 schedule from operations.nfl.com...');
  
  try {
    const puppeteer = require('puppeteer');
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set a longer timeout for the page to load
    await page.setDefaultTimeout(30000);
    
    console.log('📄 Navigating to NFL Operations schedule page...');
    await page.goto('https://operations.nfl.com/gameday/nfl-schedule/2025-nfl-schedule/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('⏳ Waiting for page to fully load...');
    await page.waitForTimeout(5000);
    
    // Try to find and click any "Show All" or "Load More" buttons
    try {
      const showAllButton = await page.$('button:contains("Show All"), button:contains("Load More"), button:contains("View All")');
      if (showAllButton) {
        console.log('🔄 Clicking "Show All" button...');
        await showAllButton.click();
        await page.waitForTimeout(3000);
      }
    } catch (error) {
      console.log('ℹ️ No "Show All" button found or clickable');
    }
    
    console.log('📊 Extracting complete schedule data...');
    
    const scheduleData = await page.evaluate(() => {
      const games = [];
      
      // Look for all possible schedule containers
      const selectors = [
        'table',
        '[data-schedule]',
        '.schedule-table',
        '.game-schedule',
        '.nfl-schedule',
        '.schedule-container',
        'tbody tr',
        '.schedule-row',
        '.game-row'
      ];
      
      let allElements = [];
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        allElements = allElements.concat(Array.from(elements));
      });
      
      console.log(`Found ${allElements.length} potential schedule elements`);
      
      // Process tables
      const tables = document.querySelectorAll('table');
      tables.forEach((table, tableIndex) => {
        const rows = table.querySelectorAll('tr');
        console.log(`Table ${tableIndex}: ${rows.length} rows`);
        
        rows.forEach((row, rowIndex) => {
          const cells = row.querySelectorAll('td, th');
          if (cells.length >= 3) {
            const rowData = Array.from(cells).map(cell => cell.textContent.trim());
            
            // Look for game data patterns
            const hasTeamNames = rowData.some(cell => 
              cell.includes('vs') || 
              cell.includes('@') || 
              cell.includes('Chiefs') || 
              cell.includes('Cowboys') ||
              cell.includes('Patriots') ||
              cell.includes('Packers')
            );
            
            const hasTime = rowData.some(cell => 
              cell.includes(':') || 
              cell.includes('p.m.') || 
              cell.includes('a.m.') ||
              cell.includes('ET') ||
              cell.includes('PT')
            );
            
            const hasBroadcast = rowData.some(cell => 
              cell.includes('CBS') || 
              cell.includes('FOX') || 
              cell.includes('NBC') || 
              cell.includes('ESPN') ||
              cell.includes('NFLN') ||
              cell.includes('Prime')
            );
            
            if (hasTeamNames || (hasTime && hasBroadcast)) {
              games.push({
                week: tableIndex + 1,
                rowIndex,
                rawData: rowData,
                hasTeamNames,
                hasTime,
                hasBroadcast,
                extracted: true
              });
            }
          }
        });
      });
      
      // Also look for any JSON data in script tags
      const scripts = document.querySelectorAll('script');
      let jsonData = null;
      scripts.forEach(script => {
        const content = script.textContent;
        if (content.includes('schedule') && content.includes('games')) {
          try {
            // Try to extract JSON from script content
            const jsonMatch = content.match(/\{.*"schedule".*\}/s);
            if (jsonMatch) {
              jsonData = JSON.parse(jsonMatch[0]);
            }
          } catch (e) {
            // Ignore JSON parsing errors
          }
        }
      });
      
      return {
        games,
        jsonData,
        pageTitle: document.title,
        url: window.location.href,
        tablesFound: tables.length,
        totalElements: allElements.length,
        bodyText: document.body.textContent.substring(0, 1000)
      };
    });
    
    console.log('📊 Scraping Results:');
    console.log(`  - Page Title: ${scheduleData.pageTitle}`);
    console.log(`  - Tables Found: ${scheduleData.tablesFound}`);
    console.log(`  - Total Elements: ${scheduleData.totalElements}`);
    console.log(`  - Games Extracted: ${scheduleData.games.length}`);
    console.log(`  - JSON Data Found: ${scheduleData.jsonData ? 'Yes' : 'No'}`);
    
    if (scheduleData.games.length > 0) {
      console.log('📅 Sample extracted games:');
      scheduleData.games.slice(0, 10).forEach((game, index) => {
        console.log(`  ${index + 1}. Week ${game.week}, Row ${game.rowIndex}: ${game.rawData.join(' | ')}`);
      });
    }
    
    if (scheduleData.jsonData) {
      console.log('📄 JSON data structure:', Object.keys(scheduleData.jsonData));
    }
    
    await browser.close();
    
    // Save the scraped data
    const outputPath = path.join(__dirname, '..', 'data', 'nfl-2025-complete-schedule.json');
    fs.writeFileSync(outputPath, JSON.stringify(scheduleData, null, 2));
    console.log(`💾 Saved complete scraped data to: ${outputPath}`);
    
    return scheduleData;
    
  } catch (error) {
    console.error('❌ Error scraping NFL schedule:', error);
    throw error;
  }
}

if (require.main === module) {
  scrapeCompleteNFLSchedule()
    .then(data => {
      console.log(`✅ Scraping completed! Found ${data.games?.length || 0} games`);
      if (data.games.length < 100) {
        console.log('⚠️  Warning: Found fewer games than expected. The website might have a different structure.');
      }
    })
    .catch(error => {
      console.error('❌ Scraping failed:', error);
    });
}

module.exports = { scrapeCompleteNFLSchedule };
