import axios, { AxiosResponse } from 'axios';
import cheerio from 'cheerio';
import { timeout } from '../helpers';

(async () => {
	const startingId = 373126;

	// Find where the end is by 10000
	// for (let i = 0; i < 15; i++) {
	// 	await getDetails(startingId + (i * 10000));

	// 	await timeout(2000);
	// }

	// Find where the end is by 2500
	// for (let i = 0; i < 15; i++) {
	// 	await getDetails(startingId + (i * 2500));

	// 	await timeout(2000);
	// }

	for (let i = 0; i < 15; i++) {
		await getDetails(startingId + i);

		await timeout(2000);
	}

})();

async function getDetails(sosId: number) {
	const url = `https://bizfilings.vermont.gov/online/BusinessInquire/BusinessInformation?businessID=${sosId}`;

	let axiosResponse: AxiosResponse;
	try {
		axiosResponse = await axios.get(url, {
			headers: {
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
				'cookie': 'visid_incap_2224160=8OJuO2TUSXejLRv2UQD1EOXr/14AAAAAQUIPAAAAAACA0qaj4fkQJojUi5vMMFij; _ga=GA1.2.2050730891.1593830374; visid_incap_2276107=aw2KKDFuS8+JO0jjXGTRDENfAF8AAAAAQUIPAAAAAABM4erwbYXZOZoFE8tNEHi2; onlinecollapsibleheaderid=0; incap_ses_124_2276107=1wAZfF/ym3NNHidjhom4AdDNAV8AAAAA7P3/P8xwwaLHIv4regAvEQ==; ASP.NET_SessionId=3hrquyy5i2yxpyvtrpaoeopz; __RequestVerificationToken=hEve0BVRrK2Hv5PjdE0lYqiXUpbG_uyTmaouP1iEbTJMA0Y6ZUma3eRYv4GpEnTCoOH5t7tQqeeU7gw31nvvH0Ir9vva2KA_Jn5OxZE8AyvhiDpNrupKSwKvLlv-mHRgFQv5NSBrtML8RZ1gLXx2SA2'
			}
		});
	}
	catch (e) {
		console.log('Error', e.response ? e.response.status : 'No response');
		return;
	}

	const $ = cheerio.load(axiosResponse.data);

	const businessDetailsRows = $(`${getTableSelector(2)} > td > table > tbody > tr`);

	const business: any = {};

	for (let i = 0; i < businessDetailsRows.length; i++) {
		const row$ = cheerio.load(businessDetailsRows[i]);
		const cells = row$('td');

		for (let cellsIndex = 0; cellsIndex < cells.length; cellsIndex++) {
			const labelCell = row$(`td:nth-of-type(${cellsIndex})`).text();

			switch (labelCell) {
				case 'Date of Incorporation / Registration Date:':
					business.filingDate = row$(`td:nth-of-type(${cellsIndex}) + td`).text();
					break;
				case 'Business Name:':
					business.title = row$(`td:nth-of-type(${cellsIndex}) + td label`).text();
					break;
				case 'Business Description:':
					business.industry = row$(`td:nth-of-type(${cellsIndex}) + td`).text();
					break;
				case 'NAICS Code:':
					business.industry = row$(`td:nth-of-type(${cellsIndex}) + td`).text();
					break;
				default:
					break;
			}

		}
	}

	console.log('business', business, 'sosId', sosId);


}

function getTableSelector(tableNumber: number) {
	return `body > table > tbody > tr:nth-of-type(2) >td > table > tbody > tr:nth-of-type(3) > td > table> tbody > tr:nth-of-type(${tableNumber})`;
}