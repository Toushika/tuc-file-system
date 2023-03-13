const pt = require('puppeteer');
const fs = require('fs').promises;
const deleteBlock = async (fileHashValue) => {
    return pt.launch({
        headless: true,
        devtools: false,
        ignoreHTTPSErrors: true,
        slowMo: 0,
        args: ['--disable-gpu', '--no-sandbox', '--no-zygote', '--disable-setuid-sandbox', '--disable-accelerated-2d-canvas', '--disable-dev-shm-usage', "--proxy-server='direct://'", "--proxy-bypass-list=*"]

    }).then(async browser => {
        //browser new page
        try {
            const page = await browser.newPage();
            await page.setDefaultNavigationTimeout(6000);
            const cookiesString = await fs.readFile("./cookies.json");
            const cookies = JSON.parse(cookiesString);
            await page.setCookie(...cookies);
            await page.setRequestInterception(true);
            page.on("request", async interceptedRequest => {
                interceptedRequest.continue({
                    method: "DELETE",//PUT//DELETE
                    headers: {
                        accept: 'text/html'
                    }
                });
            });
            await page.goto('https://www.tu-chemnitz.de/informatik/DVS/blocklist/' + fileHashValue,
                { waitUntil: 'domcontentloaded' }
            ).catch(e => error = e);
          

        } catch (err) {
            console.error(err);
        }
        await browser.close();
        return 204;
    })
   
}
module.exports = { deleteBlock }