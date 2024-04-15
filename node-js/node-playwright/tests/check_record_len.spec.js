const {test, expect} = require('@playwright/test');

// run `npx playwright test` to get report
test('check save 10 record', async ({page}) => {
    await page.goto('https://news.ycombinator.com');

    const items = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.athing')).slice(0, 10);
        return items.map(el => {
            const title = el.querySelector('.titleline a').innerText;
            const url = el.querySelector('.titleline a').href;
            return {title, url};
        });
    });

    expect(items.length).toBe(10);
});

// run `npx playwright show-report` to see report