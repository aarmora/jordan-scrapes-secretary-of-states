import axios from 'axios';
import cheerio from 'cheerio';
import { timeout } from '../helpers';

(async () => {
	const startingId = 20207298;

	for (let i = 0; i < 20; i++) {
		const business = await getDetails(startingId + i);

		console.log('Business', business, startingId + i);

		await timeout(5000);
	}

})();


async function getDetails(id: number) {
	const url = `https://icrs.informe.org/nei-sos-icrs/ICRS?CorpSumm=${id}DC`;

	const axiosResponse = await axios.get(url);

	const $ = cheerio.load(axiosResponse.data);

	const title = $('table > tbody > tr:nth-of-type(3) > td > table > tbody > tr:nth-of-type(5) td:nth-of-type(1)').text();
	const filingDate = $('table > tbody > tr:nth-of-type(3) > td > table > tbody > tr:nth-of-type(7) td:nth-of-type(1)').text();
	const agentInformation = $('table > tbody > tr:nth-of-type(3) > td > table > table > tbody > tr:nth-of-type(12) td:nth-of-type(1)').text();


	const business = {
		title: title,
		filingDate: filingDate,
		agentInformation: agentInformation
	};

	return business;

}