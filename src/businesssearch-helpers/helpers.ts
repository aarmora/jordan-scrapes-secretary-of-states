import axios, { AxiosResponse } from 'axios';
import { timeout } from "./../helpers";
// const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
const alphabet = ["b", "s"];


export async function searchForBusinesses(domain: string, state: string, dateSearch = false) {
	// Get the date - 1 day
	const date = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString();

	const formattedBusinesses: any[] = [];
	for (let i = 0; i < alphabet.length; i++) {

		const businesses = await searchBusinesses(alphabet[i], domain, dateSearch ? date : null);

		for (let key in businesses) {
			if (businesses.hasOwnProperty(key)) {
				const currentDate = new Date();
				const formattedBusiness = {
					filingDate: businesses[key].FILING_DATE,
					recordNumber: businesses[key].RECORD_NUM,
					agent: businesses[key].AGENT,
					status: businesses[key].STATUS,
					standing: businesses[key].STANDING,
					title: businesses[key].TITLE[0].split('(')[0].trim(),
					state: state,
					sosId: businesses[key].ID,
					createdAt: currentDate,
					updatedAt: currentDate
				};
				formattedBusinesses.push(formattedBusiness);
			}
		}

		// Wait five seconds like good citizens
		await timeout(5000);
	}

	return formattedBusinesses;
}


export async function searchBusinesses(search: string, domain: string, date: string) {
	const url = `https://${domain}/api/Records/businesssearch`;
	const body = {
		SEARCH_VALUE: search,
		STARTS_WITH_YN: true,
		CRA_SEARCH_YN: false,
		ACTIVE_ONLY_YN: true
	} as any;

	if (date) {
		body.FILING_DATE = {
			start: date,
			end: null
		};
	}
	let axiosResponse: AxiosResponse;

	try {
		axiosResponse = await axios.post(url, body);
	}
	catch (e) {
		console.log(`Error searching ${domain} business info for`, search, e.response ? e.response.data : '');
		throw `Error searching ${domain} business info for ${search}`;

	}

	console.log('Total business found using', search, Object.keys(axiosResponse.data.rows).length);

	if (axiosResponse.data) {
		return Promise.resolve(axiosResponse.data.rows);
	}
	else {
		return Promise.resolve(null);
	}
}

export async function getBusinessDetails(businesses: any[], domain: string) {

	console.log('business.length', businesses.length);

	for (let i = 0; i < businesses.length; i++) {

		const businessInfo = await getBusinessInformation(businesses[i].sosId, domain);

		for (let drawer of businessInfo.DRAWER_DETAIL_LIST) {
			switch (drawer.LABEL) {
				case 'Filing Type':
					businesses[i].filingType = drawer.VALUE;
					break;
				case 'Status':
					businesses[i].status = drawer.VALUE;
					break;
				case 'Formed In':
					businesses[i].formedIn = drawer.VALUE;
					break;
				case 'Principal Address':
					const principalAddressSplit = drawer.VALUE.split(/\n/);
					businesses[i].principalAddressStreet = principalAddressSplit[0];

					const formattedPrincipalCityStateAndZip = formatCityStateAndZip(principalAddressSplit[1]);
					businesses[i].principalAddressCity = formattedPrincipalCityStateAndZip.city;
					businesses[i].principalAddressState = formattedPrincipalCityStateAndZip.state;
					businesses[i].principalAddressZipcode = formattedPrincipalCityStateAndZip.zipcode;
					break;
				case 'Mailing Address':
					const mailingAddressSplit = drawer.VALUE.split(/\n/);
					businesses[i].mailingAddressStreet = mailingAddressSplit[0];

					const formattedMailingCityStateAndZip = formatCityStateAndZip(mailingAddressSplit[1]);
					businesses[i].mailingAddressCity = formattedMailingCityStateAndZip.city;
					businesses[i].mailingAddressState = formattedMailingCityStateAndZip.state;
					businesses[i].mailingAddressZipcode = formattedMailingCityStateAndZip.zipcode;
					break;
				case 'AR Due Date':
					businesses[i].arDueDate = drawer.VALUE;
					break;
				case 'Registered Agent':
					const registeredAgentSplit = drawer.VALUE.split(/\n/);
					businesses[i].registeredAgentType = registeredAgentSplit[0];
					businesses[i].registeredAgentId = registeredAgentSplit[1];
					businesses[i].registeredAgentName = registeredAgentSplit[2];
					businesses[i].registeredAgentStreetAddress = registeredAgentSplit[3];

					const formattedCityStateAndZip = formatCityStateAndZip(registeredAgentSplit[4]);
					businesses[i].registeredAgentCity = formattedCityStateAndZip.city;
					businesses[i].registeredAgentState = formattedCityStateAndZip.state;
					businesses[i].registeredAgentZipcode = formattedCityStateAndZip.zipcode;
					break;
				case 'Nature of Business':
					businesses[i].industry = drawer.VALUE;
					break;
				case 'Initial Filing Date':
					businesses[i].filingDate = drawer.VALUE;
					break;
				case 'Owner Name':
					businesses[i].ownerName = drawer.VALUE;
					break;
			}
		}

		businesses[i].updatedAt = new Date();
	}
}

export async function getBusinessInformation(businessId: number, domain: string) {
	const url = `https://${domain}/api/FilingDetail/business/${businessId}/false`;

	let axiosResponse: AxiosResponse;
	try {
		axiosResponse = await axios.get(url);
	}
	catch (e) {
		console.log(`Error getting ${domain} business info for`, businessId);
		throw `Error getting ${domain} business info for ${businessId}`;
	}

	return Promise.resolve(axiosResponse.data);

}

function formatCityStateAndZip(cityStateAndZip: string) {
	const cityStateAndZipObject = {
		city: '',
		state: '',
		zipcode: ''
	};
	if (cityStateAndZip) {
		cityStateAndZipObject.city = cityStateAndZip.split(',')[0];
		cityStateAndZipObject.state = cityStateAndZip.split(',')[1] ? cityStateAndZip.split(',')[1].trim().split(' ')[0] : '';
		// Sometimes there are two spaces between the state and the zipcode

		if (cityStateAndZip.split(',')[1]) {
			let zipcode = cityStateAndZip.split(',')[1].trim().split(' ').length < 3 ?
				cityStateAndZip.split(',')[1].trim().split(' ')[1] : cityStateAndZip.split(',')[1].trim().split(' ')[2];

			cityStateAndZipObject.zipcode = zipcode;
		}

		return cityStateAndZipObject;
	}

	return cityStateAndZipObject;
}