import fs from 'fs';
import puppeteer from "puppeteer";
import allPhrases from '../grammar/data/test.js';
import translated from '../grammar/data/translated.js';

export const index = { value: 0 };

const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      args: ["--hide-scrollbars", "--disable-web-security"],
      headless: true,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(2 * 60 * 1000);
    await page.goto("https://translate.google.com.ua/?hl=en&sl=en&tl=ru&op=translate");

    async function loop() {
      const key = allPhrases[index.value];
      if (!translated[key]) {
        await page.evaluate(() => {
          document.querySelector('textarea').value = '';
        });
        await page.type('textarea', key);
        await delay(2000);
        const els = await page.$$('span[lang="ru"]');
        const arr = await Promise.all(els.slice(-2).map(el => el.evaluate(e => e.innerText)));
        translated[key] = arr.join('... ');
        console.log(key);
      }
      await delay(2000);
      if (index.value !== -1) return loop();
    };
    await loop();
    fs.writeFileSync('../grammar/data/translated.js', `module.exports = ${JSON.stringify(translated, null, 4)}`);
  } catch (err) {
    console.error(err);
  } finally {
    console.error('Stopped Puppeteer!');
    browser?.close();
  }
})();
