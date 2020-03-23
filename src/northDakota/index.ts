import { searchForBusinesses, getBusinessDetails } from "./../businesssearch-helpers/helpers";

(async () => {
	const domain = 'firststop.sos.nd.gov';
	const businesses = await searchForBusinesses(domain, 'North Dakota');
	await getBusinessDetails(businesses, domain);

	console.log('businesses', businesses);

})();