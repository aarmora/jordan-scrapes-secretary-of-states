import { getBusinessDetails } from "./getBusinessDetails";
import { searchForBusinesses } from "./searchForBusinesses";

(async () => {

	const businesses = await searchForBusinesses();
	await getBusinessDetails(businesses);

	console.log('businesses', businesses);

})();