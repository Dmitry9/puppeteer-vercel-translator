const puppeteer = require("puppeteer");
require("dotenv").config();

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

let browser;
let page;

async function scrape(text) {
  try {
    if (!browser) {
      browser = await puppeteer.launch({
        args: [
          "--disable-setuid-sandbox",
          "--no-sandbox",
          "--no-zygote",
          "--hide-scrollbars",
          "--disable-web-security",
        ],
        headless: "new",
        ignoreHTTPSErrors: true,
        executablePath:
          process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
      });
    }
    if (!page) {
      page = await browser.newPage();
      page.setDefaultNavigationTimeout(2 * 60 * 1000);
      await page.goto("https://translate.google.com/?tl=ru");
    }

    await delay(2000);
    await page.evaluate(() => {
      document.querySelector("textarea").value = "";
    });
    await page.type("textarea", text);
    await delay(2000);
    const els = await page.$$('span[lang="ru"]');
    const arr = await Promise.all(
      els.slice(-2).map((el) => el.evaluate((e) => e.innerText))
    );
    return arr.join("... ");
  } catch (err) {
    console.error(err);
    browser?.close();
    console.error("Error occured while scraping");
  } finally {
    setTimeout(() => {
      console.error("Stopped Puppeteer!");
      browser?.close();
    }, 30 * 60 * 1000);
  }
}

module.exports = { scrape };
