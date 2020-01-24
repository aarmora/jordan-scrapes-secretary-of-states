import { getBusinessInformation } from './idaho';
import { timeout } from "./../helpers";

// (async () => {

// 	await getBusinessDetails();

// })();

export async function getBusinessDetails(businesses: any[]) {

	console.log('business.length', businesses.length);

	for (let i = 0; i < businesses.length; i++) {

		const businessInfo = await getBusinessInformation(businesses[i].sosId);
		console.log('checking business info for', businesses[i]);

		businesses[i].filingType = businessInfo.DRAWER_DETAIL_LIST[0].VALUE;
		businesses[i].status = businessInfo.DRAWER_DETAIL_LIST[1].VALUE;
		businesses[i].formedIn = businessInfo.DRAWER_DETAIL_LIST[2].VALUE;

		// Principal address stuff
		const principalAddressSplit = businessInfo.DRAWER_DETAIL_LIST[4].VALUE.split(/\n/);
		businesses[i].principalAddressStreet = principalAddressSplit[0];

		const formattedPrincipalCityStateAndZip = formatCityStateAndZip(principalAddressSplit[1]);
		businesses[i].principalAddressCity = formattedPrincipalCityStateAndZip.city;
		businesses[i].principalAddressState = formattedPrincipalCityStateAndZip.state;
		businesses[i].principalAddressZipcode = formattedPrincipalCityStateAndZip.zipcode;

		// Mailing address stuff
		const mailingAddressSplit = businessInfo.DRAWER_DETAIL_LIST[5].VALUE.split(/\n/);
		businesses[i].mailingAddressStreet = mailingAddressSplit[0];

		const formattedMailingCityStateAndZip = formatCityStateAndZip(mailingAddressSplit[1]);
		businesses[i].mailingAddressCity = formattedMailingCityStateAndZip.city;
		businesses[i].mailingAddressState = formattedMailingCityStateAndZip.state;
		businesses[i].mailingAddressZipcode = formattedMailingCityStateAndZip.zipcode;

		if (businessInfo.DRAWER_DETAIL_LIST[7] && businessInfo.DRAWER_DETAIL_LIST[7].LABEL === 'AR Due Date') {
			businesses[i].arDueDate = businessInfo.DRAWER_DETAIL_LIST[7].VALUE;
		}
		// Don't love how this duplicates
		else if (businessInfo.DRAWER_DETAIL_LIST[7] && businessInfo.DRAWER_DETAIL_LIST[7].LABEL === 'Registered Agent') {
			// Registered agent stuff
			const registeredAgentSplit = businessInfo.DRAWER_DETAIL_LIST[7].VALUE.split(/\n/);
			businesses[i].registeredAgentType = registeredAgentSplit[0];
			businesses[i].registeredAgentId = registeredAgentSplit[1];
			businesses[i].registeredAgentName = registeredAgentSplit[2];
			businesses[i].registeredAgentStreetAddress = registeredAgentSplit[3];

			const formattedCityStateAndZip = formatCityStateAndZip(registeredAgentSplit[4]);
			businesses[i].registeredAgentCity = formattedCityStateAndZip.city;
			businesses[i].registeredAgentState = formattedCityStateAndZip.state;
			businesses[i].registeredAgentZipcode = formattedCityStateAndZip.zipcode;

		}


		if (businessInfo.DRAWER_DETAIL_LIST[8] && businessInfo.DRAWER_DETAIL_LIST[8].LABEL === 'Registered Agent') {
			// Registered agent stuff
			const registeredAgentSplit = businessInfo.DRAWER_DETAIL_LIST[8].VALUE.split(/\n/);
			businesses[i].registeredAgentType = registeredAgentSplit[0];
			businesses[i].registeredAgentId = registeredAgentSplit[1];
			businesses[i].registeredAgentName = registeredAgentSplit[2];
			businesses[i].registeredAgentStreetAddress = registeredAgentSplit[3];

			const formattedCityStateAndZip = formatCityStateAndZip(registeredAgentSplit[4]);
			businesses[i].registeredAgentCity = formattedCityStateAndZip.city;
			businesses[i].registeredAgentState = formattedCityStateAndZip.state;
			businesses[i].registeredAgentZipcode = formattedCityStateAndZip.zipcode;
		}


		businesses[i].updatedAt = new Date();
	}
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