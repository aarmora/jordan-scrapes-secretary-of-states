import { searchForBusinesses, getBusinessDetails } from "./../businesssearch-helpers/helpers";

(async () => {
	const domain = 'firststop.sos.nd.gov';
	const businesses = await searchForBusinesses(domain, 'North Dakota');
	await getBusinessDetails([businesses[10], businesses[255], businesses[344]], domain);

	console.log('business-10', businesses[10], businesses[255], businesses[344]);

})();