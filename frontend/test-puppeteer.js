import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    const r = Math.random().toString(36).substring(7);
    const email = `test${r}@test.com`;
    console.log("Registering user:", email);
    
    await page.goto('http://localhost/register');
    
    const inputs = await page.$$('input');
    await inputs[0].type('Test User');
    await inputs[1].type(email);
    await inputs[2].type('password123');
    await inputs[3].type('password123');
    
    await Promise.all([
      page.waitForNavigation({waitUntil: 'networkidle0'}),
      page.click('button[type="submit"]')
    ]);
    
    console.log("URL is:", page.url());
    
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    fs.writeFileSync('body.html', bodyHTML);
    console.log("Saved body.html, length:", bodyHTML.length);
    
    await browser.close();
  } catch (err) {
    console.error("SCRIPT ERROR:", err);
  }
})();
