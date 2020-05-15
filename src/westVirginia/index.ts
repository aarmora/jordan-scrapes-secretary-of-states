import axios from 'axios';
import cheerio from 'cheerio';

(async () => {
	// const startingId = 11045521;
	const startingId = 493294;

	for (let i = 0; i < 20; i++) {
		await getBusinessDetails(startingId + i);
	}

})();

async function getBusinessDetails(id: number) {
	const url = `https://apps.sos.wv.gov/business/corporations/organization.aspx?org=${id}`;

	const axiosResponse = await axios.get(url);

	const $ = cheerio.load(axiosResponse.data);

	const title = $('#lblOrg').text();
	const date = $('table:nth-of-type(1) tr:nth-of-type(3) td:nth-of-type(4)').text();
	const address = $('table:nth-of-type(3) tr:nth-of-type(3) td:nth-of-type(1)').text();
	const officer = $('table:nth-of-type(4) tr:nth-of-type(3) td:nth-of-type(1)').text();

	const business = {
		title: title,
		date: date,
		address: address,
		officer: officer
	};

	console.log('business', business);
}