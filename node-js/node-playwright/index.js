// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const {chromium} = require("playwright");
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// run `npx playwright install chromium firefox webkit` to build browser env
async function saveHackerNewsArticles() {
    // launch browser
    const browser = await chromium.launch({headless: false});
    const context = await browser.newContext();
    const page = await context.newPage();

    // go to Hacker News
    await page.goto("https://news.ycombinator.com");

    // user selector
    const articles = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.athing')).slice(0, 10);
        return items.map(el => {
            const title = el.querySelector('.titleline a').innerText;
            const url = el.querySelector('.titleline a').href;
            return {title, url};
        });
    });

    const csvWriter = createCsvWriter({
        path: 'hacker_news_articles.csv',
        header: [
            {id: 'title', title: 'title'},
            {id: 'url', title: 'url'}
        ],
        append: false // everytime create one
    });

    // everytime check file to ensure a new file
    if (fs.existsSync('hacker_news_articles.csv')) {
        fs.unlinkSync('hacker_news_articles.csv');
    }

    await csvWriter.writeRecords(articles);

    // close browser
    await browser.close();
}

// run `node index.js` to get data
(async () => {
    await saveHackerNewsArticles();
})();
