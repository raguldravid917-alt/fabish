const puppeteer = require('puppeteer-core');

const PAGES = [
  'http://localhost:4173/account/login',
  'http://localhost:4173/account/register',
  'http://localhost:4173/collections',
  'http://localhost:4173/collections/skin-care',
  'http://localhost:4173/collections/all',
  'http://localhost:4173/products/aura-natural-face-cream',
  'http://localhost:4173/blogs/news'
];

const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 375, height: 812 },
  { width: 412, height: 915 }
];

(async () => {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ]
  });

  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[PAGE CONSOLE ERROR] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    console.error('--- PAGE ERROR CRASH ---');
    console.error('URL:', page.url());
    console.error(err.stack || err.toString());
    console.error('------------------------');
  });

  const runPass = async (passName, setupStorageFn) => {
    console.log(`\n=================== PASS: ${passName} ===================`);
    for (const url of PAGES) {
      for (const vp of VIEWPORTS) {
        await page.setViewport({
          width: vp.width,
          height: vp.height,
          isMobile: true,
          hasTouch: true
        });
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1');

        try {
          // Open page first to be on correct origin for localStorage
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });
          
          // Setup state
          await page.evaluate(setupStorageFn);
          
          // Reload to apply state
          await page.reload({ waitUntil: 'load' });
          await new Promise(resolve => setTimeout(resolve, 800));
        } catch (err) {
          console.error(`Error on ${url}:`, err.message);
        }
      }
    }
  };

  // PASS 1: Invalid / Expired Token
  await runPass('Expired Token', () => {
    localStorage.clear();
    localStorage.setItem('token', 'invalid-expired-token-123');
  });

  // PASS 2: Guest Cart Corrupted
  await runPass('Corrupted Guest Cart', () => {
    localStorage.clear();
    localStorage.setItem('guest_cartItems', 'invalid-json-{');
  });

  // PASS 3: Full Guest State
  await runPass('Clean Guest State', () => {
    localStorage.clear();
  });

  console.log('Finished tests. Closing browser.');
  await browser.close();
})();
