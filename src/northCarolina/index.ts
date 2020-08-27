import axios from 'axios';
import cheerio from 'cheerio';
import FormData from 'form-data';
import { timeout } from '../helpers';

(async () => {
	const startingSosId = 2011748;

	// Increment by large amounts so we can find the most recently registered businesses
	for (let i = 0; i < 5000; i += 100) {
		// We use the query post to get the database id
		const databaseId = await getDatabaseId(startingSosId + i);

		// With the database id we can just POST directly to the details endpoint
		if (databaseId) {
			await getBusinessDetails(databaseId);
		}

		// Good neighbor timeout
		await timeout(1000);
	}
})();

async function getDatabaseId(sosId: number) {
	const url = 'https://www.sosnc.gov/online_services/search/Business_Registration_Results';

	const formData = new FormData();
	formData.append('SearchCriteria', sosId.toString());
	formData.append('__RequestVerificationToken', 'qnPxLQeaFPiEj4f1so7zWF8e5pTwiW0Ur8A0qkiK_45A_3TL__wTjYlmaBmvWvYJVd2GiFppbLB39eD0F6bmbEUFsQc1');
	formData.append('CorpSearchType', 'CORPORATION');
	formData.append('EntityType', 'ORGANIZATION');
	formData.append('Words', 'SOSID');


	const axiosResponse = await axios.post(url, formData,
		{
			headers: formData.getHeaders()
		});

	const $ = cheerio.load(axiosResponse.data);

	const onclickAttrib = $('.double tbody tr td a').attr('onclick');
	if (onclickAttrib) {
		const databaseId = onclickAttrib.split("ShowProfile('")[1].replace("')", '');

		return databaseId;
	}
	else {
		console.log('No business found for SosId', sosId);
		return null;
	}
}

async function getBusinessDetails(databaseId: string) {
	const url = 'https://www.sosnc.gov/online_services/search/_Business_Registration_profile';

	const formData = new FormData();
	formData.append('Id', databaseId);
	const axiosResponse = await axios.post(url, formData,
		{
			headers: formData.getHeaders()
		});

	const $ = cheerio.load(axiosResponse.data);

	const business: any = {
		businessId: databaseId
	};

	business.title = $('.printFloatLeft section:nth-of-type(1) div:nth-of-type(1) span:nth-of-type(2)').text();
	if (business.title) {
		business.title = business.title.replace(/\n/g, '').trim()
	}
	else {
		console.log('No business title found. Likely no business here', databaseId);
		return;
	}
	const informationFields = $('.printFloatLeft section:nth-of-type(2) div:nth-of-type(1) span');

	for (let i = 0; i < informationFields.length; i++) {
		if (informationFields[i].attribs.class === 'greenLabel') {
			// This is kind of perverting cheerio objects
			const label = informationFields[i].children[0].data.trim();
			const value = informationFields[i + 1].children[0].data.trim();

			switch (label) {
				case 'SosId:':
					business.sosId = value;
					break;
				case 'Citizenship:':
					business.citizenShip = value;
					break;
				case 'Status:':
					business.status = value;
					break;
				case 'Date Formed:':
					business.filingDate = value;
					break;
				default:
					break;
			}
		}
	}

	console.log('business', business);
} 