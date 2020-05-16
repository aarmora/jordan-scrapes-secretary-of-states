import axios from 'axios';
import cheerio from 'cheerio';
import { timeout } from '../helpers';

(async () => {
	let startingId = 802447095;
	const businesses: any[] = [];
	let notFoundCount = 0;

	while (notFoundCount < 20) {
		try {
			const business = await getDetails(startingId);

			if (business.title) {
				businesses.push(business);
				notFoundCount = 0;
				console.log('business', business);
			}
			else {
				notFoundCount++;
			}
			startingId++;
			console.log('notFoundCount', notFoundCount, 'businesses.length', businesses.length);

		}
		catch (e) {
			notFoundCount++;
			console.log('Error making request for', startingId);
		}
		await timeout(1000);
	}

})();

async function getDetails(id: number) {
	const url = `https://cofs.lara.state.mi.us/CorpWeb/CorpSearch/CorpSummary.aspx?ID=${id}&SEARCH_TYPE=3&CanReturn=True`;
	const axiosResponse = await axios.get(url);

	const $ = cheerio.load(axiosResponse.data);

	const title = $('#MainContent_lblEntityNameHeader').text();
	const filingDate = $('#MainContent_lblOrganisationDate').text();
	const agentName = $('#MainContent_lblResidentAgentName').text();
	const agentStreetAddress = $('#MainContent_lblResidentStreet').text();
	const agentCity = $('#MainContent_lblResidentCity').text();
	const agentState = $('#MainContent_lblResidentState').text();
	const agentZip = $('#MainContent_lblResidentZip').text();

	const business = {
		title: title,
		filingDate: filingDate,
		agentName: agentName,
		agentStreetAddress: agentStreetAddress,
		agentCity: agentCity,
		agentState: agentState,
		agentZip: agentZip,
		sosId: id
	};

	return business;
}