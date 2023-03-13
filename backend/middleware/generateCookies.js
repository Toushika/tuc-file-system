const pt = require('puppeteer');
const fs = require('fs').promises;
require('dotenv').config();
//const port = process.env.port || 5000;
const generateCookies = async () => {
    const sleep = (milliseconds) => {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    };
    //adding headless flag to false
    pt.launch({
        headless: true

    }).then(async browser => {
        //browser new page
        try {
            const page = await browser.newPage();

            await page.goto('https://"username":"+password+"@wtc.tu-chemnitz.de/krb/saml2/idp/SSOService.php?SAMLRequest=fZJPT4MwGMa%2FCul9lHVBtmYswe3gkumIoAcvBso7aYQW%2BxZRP70wppkedmz69Pf8SZeY1VXDo9aW6h7eWkDrfNSVQn68CElrFNcZSuQqqwG5FTyJbnecuR5vjLZa6Io4ESIYK7Vaa4VtDSYB8y4FPNzvQlJa2yCntOs617YTUUKtpP1yC6BJKfNcV2BLF1HTgcxovE9S4mz6KFJlA%2FQMYcV%2FxKvJ6ZCVUVk0NEn2J2u3KRvibDcheZ5PD4HP2EEcCh%2BC%2FiAWPhQLwfyczfLA72WILWwV2kzZkDCPsYl3NWFB6vl8NufT4Ik48anttVSFVC%2BXp8lHEfKbNI0nY6NHMHhs0wvIajmE5kdjczb5ZWz2szNZXVgVf1dd0jOX0bLhdz12u4l1JcWnE1WV7tYGMgshmRK6Gp%2F8%2FRKrbw%3D%3D&RelayState=ss%3Amem%3A01e302651e7810ad5524a890802944b431a22bd760b324b245656528d83b3824', {
                waitUntil: "networkidle2",
            });
            const navigationPromise = page.waitForNavigation()
            await page.type('input[name="username"]', "raht")
            await page.click('input[type="submit"]')
            // await page.waitForSelector('#password')
            await navigationPromise
            await page.type('input[name="password"]', "Amante739#")
           // page.waitForNavigation()
          
            await page.click('input[type="submit"]')
           
            await sleep(5000);
            const cookies = await page.cookies();
            await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
           // await browser.close();
        }
        catch (err) {
            console.error(err);
        }
        console.log("cookies initiated");
        await browser.close();
        return true;
    });

    //return true;
}
module.exports = { generateCookies }