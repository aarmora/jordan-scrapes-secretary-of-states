import puppeteer from 'puppeteer';
import axios from 'axios';
import cheerio from 'cheerio';

const alphabet = ["a", "b"]; // "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

(async () => {
	const browser = await puppeteer.launch({ headless: false });
	const url = 'https://wyobiz.wy.gov/Business/FilingSearch.aspx';


	for (let letter of alphabet) {
		const context = await browser.createIncognitoBrowserContext();
		const page = await context.newPage();

		await page.goto(url);

		await page.type('#MainContent_txtFilingName', letter);

		await page.click('#MainContent_cmdSearch');

		await page.waitForSelector('#MainContent_lblHeaderPages');

		const numberOfPages = await page.$eval('#MainContent_lblHeaderPages', element => element.textContent);

		for (let pageNumber = 1; pageNumber < parseInt(numberOfPages); pageNumber++) {
			await page.waitForSelector('ol li');
			const rowElements = await page.$$('ol li');

			const urls: string[] = [];

			for (let i = 0; i < rowElements.length; i++) {
				const status = await rowElements[i].$eval('.resFile2', element => element.textContent);

				if (status.includes('Active')) {
					const href = await rowElements[i].$eval('a', element => element.getAttribute('href'));
					const title = await rowElements[i].$eval('.resultField', element => element.textContent);
					console.log('title in search screen', title);

					urls.push(href);
				}
			}

			console.log('urls', urls);

			for (let i = 0; i < urls.length; i++) {
				await getDetails(urls[i]);
			}

			await page.click('#MainContent_lbtnNextHeader');
		}


		await context.close();
	}

	await browser.close();


})();


export async function getDetails(href: string) {
	const baseUrl = 'https://wyobiz.wy.gov/Business/';

	const axiosResponse = await axios.get(`${baseUrl}${href}`);

	const $ = cheerio.load(axiosResponse.data);

	const name = $('#txtFilingName2').text();

	const address = $('#txtOfficeAddresss').text();

	console.log('name, address', name, address);

}