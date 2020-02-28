import puppeteer, { Browser } from 'puppeteer';
import Client from '@infosimples/node_two_captcha';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client(process.env.capatchaApiKey, {
	timeout: 60000,
	polling: 5000,
	throwErrors: false
});

(async () => {
	const browser = await puppeteer.launch({ headless: true });

	let errorCount = 0;

	// 7862248

	for (let i = 0; i < 10000; i += 100) {
		await getDelaware(browser, 7860748 + i, errorCount);
		console.log('error count', errorCount);

		if (errorCount > 10) {
			break;
		}
	}

	await browser.close();


})();

async function getDelaware(browser: Browser, entityNumber: number, errorCount: number) {
	console.log('checking', entityNumber);

	const page = await browser.newPage();
	const url = 'https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx';
	await page.setViewport({ width: 900, height: 900 });

	await page.goto(url);

	let captchaUrl = await page.$eval('#ctl00_ContentPlaceHolder1_ctl05_RadCaptcha1_CaptchaImageUP', element => element.getAttribute('src'));

	captchaUrl = captchaUrl.replace('..', 'https://icis.corp.delaware.gov/Ecorp');
	const captchaResponse = await client.decode({
		url: captchaUrl
	});

	await page.type('#ctl00_ContentPlaceHolder1_frmFileNumber', entityNumber.toString());

	await page.type('#ctl00_ContentPlaceHolder1_ctl05_rcTextBox1', captchaResponse._text);

	await page.click('#ctl00_ContentPlaceHolder1_btnSubmit');

	// Captcha failure error
	try {
		const errorMessage = await page.$eval('#ctl00_ContentPlaceHolder1_lblErrorMessage', element => element.textContent, 750);
		console.log('we possibly got the captcha wrong, we will try again', errorMessage);

		if (errorMessage) {

			await page.close();
			return await getDelaware(browser, entityNumber, errorCount);
		}
	}
	catch (e) {
	}

	try {
		await page.waitForSelector('#ctl00_ContentPlaceHolder1_rptSearchResults_ctl00_lnkbtnEntityName', { timeout: 750 });
	}
	catch (e) {
		console.log('No sign of entity name, maybe there are not any more? We will continue to the next iteration.');
		errorCount = errorCount++;
		return await page.close();

	}

	await page.click('#ctl00_ContentPlaceHolder1_rptSearchResults_ctl00_lnkbtnEntityName');

	await page.waitForSelector('#ctl00_ContentPlaceHolder1_lblIncDate');


	const date = await page.$eval('#ctl00_ContentPlaceHolder1_lblIncDate', element => element.textContent);
	const name = await page.$eval('#ctl00_ContentPlaceHolder1_lblEntityName', element => element.textContent);

	console.log('date and name', date, name);

	await page.close();
}