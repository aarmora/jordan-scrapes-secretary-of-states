import cheerio from 'cheerio';
import axios, { AxiosResponse } from 'axios';

export async function searchBusinesses(search: string, links: string[]) {
	const url = `http://egov.sos.state.or.us/br/pkg_web_name_srch_inq.do_name_srch?p_name=${search}&p_regist_nbr=&p_srch=PHASE1&p_print=FALSE&p_entity_status=ACT`;

	let axiosResponse: AxiosResponse;

	try {
		axiosResponse = await axios.get(url);
	}
	catch (e) {
		console.log('Error searching for Oregon businesses', search, e);
		throw `Error searching for Oregon businesses ${search}`;
	}

	const $ = cheerio.load(axiosResponse.data);

	$('tr td:nth-of-type(4) a').each((index, element) => {
		const link = $(element).attr('href');
		if (!links.includes(link)) {
			links.push($(element).attr('href'));
		}
	});

	console.log('links found for ', search, links.length);

}

export async function getBusinessInformation(businessLink: string) {
	const url = `http://egov.sos.state.or.us/br/${businessLink}`;

	let axiosResponse: AxiosResponse;
	try {
		axiosResponse = await axios.get(url);
	}
	catch (e) {
		console.log('Error searching specific business', url, e);
		throw `Error searching specific business ${url}`;
	}

	const $ = cheerio.load(axiosResponse.data);

	const currentDate = new Date();
	const business = {
		title: $('table:nth-of-type(3) tr td:nth-of-type(2)').text(),
		filingDate: $('table:nth-of-type(2) tr td:nth-of-type(5)[bgcolor="#CCDDFF"]').text(),
		principalAddressStreet: $('table:nth-of-type(8) tr:nth-of-type(1) td:nth-of-type(2)').text(),
		principalAddressCity: $('table:nth-of-type(9) tr:nth-of-type(1) td:nth-of-type(2)').text(),
		principalAddressState: $('table:nth-of-type(9) tr:nth-of-type(1) td:nth-of-type(3)').text(),
		principalAddressZipcode: $('table:nth-of-type(9) tr:nth-of-type(1) td:nth-of-type(4)').text(),
		registeredAgentName: `${$('table:nth-of-type(13) tr:nth-of-type(1) td:nth-of-type(2)').text()} ${$('table:nth-of-type(13) tr:nth-of-type(1) td:nth-of-type(4)').text()}`,
		registeredAgentStreetAddress: $('table:nth-of-type(14) tr:nth-of-type(1) td:nth-of-type(2)').text(),
		registeredAgentCity: $('table:nth-of-type(15) tr:nth-of-type(1) td:nth-of-type(2)').text(),
		registeredAgentState: $('table:nth-of-type(15) tr:nth-of-type(1) td:nth-of-type(3)').text(),
		registeredAgentZipcode: $('table:nth-of-type(15) tr:nth-of-type(1) td:nth-of-type(4)').text(),
		mailingAddressStreet: $('table:nth-of-type(18) tr:nth-of-type(1) td:nth-of-type(2)').text(),
		mailingAddressCity: $('table:nth-of-type(19) tr:nth-of-type(1) td:nth-of-type(2)').text(),
		mailingAddressState: $('table:nth-of-type(19) tr:nth-of-type(1) td:nth-of-type(3)').text(),
		mailingAddressZipcode: $('table:nth-of-type(19) tr:nth-of-type(1) td:nth-of-type(4)').text(),
		state: 'Oregon',
		recordNumber: $('table:nth-of-type(2) tr:nth-of-type(2) td:nth-of-type(1)').text(),
		filingType: $('table:nth-of-type(2) tr:nth-of-type(2) td:nth-of-type(2)').text(),
		url: url,
		createdAt: currentDate,
		updatedAt: currentDate
	}

	console.log('found business', business.title);

	return Promise.resolve(business);
}


