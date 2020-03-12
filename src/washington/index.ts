import axios from 'axios';
import { timeout } from '../helpers';

(async () => {
	const startingNumber = 1348653;

	for (let i = 0; i < 10; i++) {
		await getBusinessDetails(startingNumber + (i * 1));
	}


})();

async function getBusinessDetails(id: number) {

	const axiosResponse = await axios.get(`https://cfda.sos.wa.gov/api/BusinessSearch/BusinessInformation?businessID=${id}`);


	if (axiosResponse.data) {
		if (axiosResponse.data.PrincipalOffice) {
			console.log('principal office PhoneNumber', axiosResponse.data.PrincipalOffice.PhoneNumber);
			console.log('principal office EmailAddress', axiosResponse.data.PrincipalOffice.EmailAddress);

			if (axiosResponse.data.PrincipalOffice.PrincipalStreetAddress) {
				console.log('principal office PrincipalStreetAddress ', axiosResponse.data.PrincipalOffice.PrincipalStreetAddress.FullAddress);
			}
		}
		console.log('BusinessName', axiosResponse.data.BusinessName);
		console.log('BusinessID', axiosResponse.data.BusinessID);
		console.log('DateOfIncorporation', axiosResponse.data.DateOfIncorporation);

	}


	await timeout(1000);

}