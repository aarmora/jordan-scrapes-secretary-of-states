import axios from 'axios';
import cheerio from 'cheerio';

(async () => {
	// 
	const id = 612231;

	for (let i = 0; i < 20; i++) {
		try {
			await getBusinessDetails(id + (i * 25));
		}
		catch (e) {
			console.log('something broke', id + (i * 25));
		}
	}

})();

export async function getBusinessDetails(id: number) {

	const url = 'https://portal.sos.state.nm.us/BFS/online/corporationbusinesssearch/CorporationBusinessInformation';
	const payload = `txtCommonPageNo=&hdnTotalPgCount=424&txtCommonPageNo=&hdnTotalPgCount=5&businessId=${id}&__RequestVerificationToken=WezJVY0GvxnAWyB0gLF74dWyoHimmADXqtBQ6wMp9U2RZKi6zBFQaoH2MmUFwKnuSZK2ZU5RsapHKPaA0q2DP5r3zWFIkYW0Aq5pYfKy1uY1`;

	const axiosResponse = await axios.post(url, payload);

	const $ = cheerio.load(axiosResponse.data);

	const entityId = $('.right_content > table tbody > tr:nth-of-type(3) table:nth-of-type(1) tr:nth-of-type(2) td:nth-of-type(2) strong').text();
	const entityName = $('.right_content > table tbody > tr:nth-of-type(3) table:nth-of-type(1) tr:nth-of-type(3) td:nth-of-type(2) strong').text();
	const address = $('.right_content > table > tbody > tr:nth-of-type(5) tr:nth-of-type(3) strong').text();
	const registeredAgentName = $('.right_content > table > tbody > tr:nth-of-type(6) tr:nth-of-type(2) strong').text();
	let dateOfIncorporation = $('.right_content > table tbody > tr:nth-of-type(3) table:nth-of-type(3) tr:nth-of-type(4) td:nth-of-type(2) strong strong').text();

	if (!dateOfIncorporation || dateOfIncorporation.trim() === 'Not Applicable') {
		dateOfIncorporation = $('.right_content > table tbody > tr:nth-of-type(3) table:nth-of-type(3) tr:nth-of-type(2) td:nth-of-type(2) strong').text();
	}

	if (!dateOfIncorporation || dateOfIncorporation.trim() === 'Not Applicable') {
		dateOfIncorporation = $('.right_content > table tbody > tr:nth-of-type(3) table:nth-of-type(3) tr:nth-of-type(3) td:nth-of-type(4) strong').text();
	}

	if (!dateOfIncorporation || dateOfIncorporation.trim() === 'Not Applicable') {
		dateOfIncorporation = $('.right_content > table tbody > tr:nth-of-type(3) table:nth-of-type(3) tr:nth-of-type(3) td:nth-of-type(2) strong').text();
	}

	if (!dateOfIncorporation || dateOfIncorporation.trim() === 'Not Applicable') {
		dateOfIncorporation = $('.right_content > table tbody > tr:nth-of-type(3) table:nth-of-type(3) tr:nth-of-type(2) td:nth-of-type(4) strong').text();
	}

	const business = {
		entityId: entityId,
		entityName: entityName,
		address: address,
		dateOfIncorporation: dateOfIncorporation,
		dbId: id,
		agent: registeredAgentName
	};

	console.log('business', business);
}