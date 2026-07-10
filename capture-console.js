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
  { width: 360, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 }
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
    console.error('Viewport:', page.viewport());
    console.error(err.stack || err.toString());
    console.error('------------------------');
  });

  for (const url of PAGES) {
    for (const vp of VIEWPORTS) {
      console.log(`Testing URL: ${url} at ${vp.width}x${vp.height}`);
      await page.setViewport({
        width: vp.width,
        height: vp.height,
        isMobile: vp.width < 1024,
        hasTouch: vp.width < 1024
      });
      if (vp.width < 1024) {
        await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1');
      } else {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36');
      }

      try {
        await page.goto(url, { waitUntil: 'load', timeout: 5000 });
        // Give React a bit of time to execute effects
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (err) {
        console.error(`Error loading ${url}:`, err.message);
      }
    }
  }

  console.log('Finished tests. Closing browser.');
  await browser.close();
})();
