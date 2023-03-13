const pt = require('puppeteer');
const fs = require('fs').promises;

const getBlockStatus =  (fileHashValue, methodType) => {
    return pt.launch({
        headless: true
    }).then(async browser => {
        //browser new page
        const page = await browser.newPage();
        const cookiesString = await fs.readFile("./cookies.json");
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);
        await page.setRequestInterception(true);
        page.once("request", interceptedRequest => {
            interceptedRequest.continue({
                method: methodType,//PUT//DELETE
                headers: {
                    ...interceptedRequest.headers(),
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });
        });
        
        const response = await page.goto('https://www.tu-chemnitz.de/informatik/DVS/blocklist/' + fileHashValue, { waitUntil: "networkidle2" });
        await browser.close();
        const StatusCode = response.status();
        return StatusCode;
        
    })
    
   
}

module.exports = { getBlockStatus }