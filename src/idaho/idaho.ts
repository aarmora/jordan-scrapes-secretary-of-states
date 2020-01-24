import axios, { AxiosResponse } from 'axios';

export async function searchBusinesses(search: string, date: string) {
	const url = 'https://sosbiz.idaho.gov/api/Records/businesssearch';
	const body = {
		SEARCH_VALUE: search,
		STARTS_WITH_YN: true,
		CRA_SEARCH_YN: false,
		ACTIVE_ONLY_YN: false,
		FILING_DATE: {
			start: date,
			end: null
		}
	};
	let axiosResponse: AxiosResponse;

	try {
		axiosResponse = await axios.post(url, body);
	}
	catch (e) {
		console.log('Error searching Idaho business info for', search, e);
		throw `Error searching Idaho business info for ${search}`;

	}

	console.log('Total business found using', search, Object.keys(axiosResponse.data.rows).length);

	if (axiosResponse.data) {
		return Promise.resolve(axiosResponse.data.rows);
	}
	else {
		return Promise.resolve(null);
	}

}

export async function getBusinessInformation(businessId: number) {
	const url = `https://sosbiz.idaho.gov/api/FilingDetail/business/${businessId}/false`;

	let axiosResponse: AxiosResponse;
	try {
		axiosResponse = await axios.get(url);
	}
	catch (e) {
		console.log('Error getting Idaho business info for', businessId);
		throw `Error getting Idaho business info for ${businessId}`;
	}

	return Promise.resolve(axiosResponse.data);

}