import axios from 'axios';
import cheerio from 'cheerio';

(async () => {

	for (let i = 0; i < 100; i++) {
		await getDetails(1342465 + i);
	}


})();

async function getDetails(id: number) {
	const url = `https://www.concord-sots.ct.gov/CONCORD/PublicInquiry?eid=9744&businessID=${id}`;

	const axiosResponse = await axios.get(url);

	const $ = cheerio.load(axiosResponse.data);

	const title = $(`${baseSelector(1, 2, 2)}`).text();
	const state = $(`${baseSelector(1, 2, 4)}`).text();
	const businessId = $(`${baseSelector(1, 3, 2)}`).text();
	const address = $(`${baseSelector(1, 4, 2)}`).text();
	const filingDate = $(`${baseSelector(1, 6, 2)}`).text();
	const prinicipalName = $(`${baseSelector(3, 3, 1)}`).text();
	const prinicipalBusinessAddress = $(`${baseSelector(3, 3, 2)}`).text();
	const prinicipalResidenceAddress = $(`${baseSelector(3, 3, 3)}`).text();

	const business = {
		title: title.trim(),
		state: state,
		businessId: businessId,
		address: address,
		filingDate: filingDate,
		prinicipalName: prinicipalName.trim().replace(/\s+/g, " "),
		prinicipalBusinessAddress: prinicipalBusinessAddress.trim(),
		prinicipalResidenceAddress: prinicipalResidenceAddress.trim()
	};

	console.log(business);
}

function baseSelector(section: number, rowWithinSection: number, cellWithinRow: number) {
	return `form > table > tbody > tr > td > table > tbody > tr:nth-of-type(2) > td > table > tbody > tr:nth-of-type(${section}) tr:nth-of-type(${rowWithinSection}) td:nth-of-type(${cellWithinRow})`;
}