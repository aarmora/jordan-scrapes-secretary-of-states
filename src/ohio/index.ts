import axios from 'axios';
import { timeout } from '../helpers';

(async () => {
	const startingId = 4479034;



	for (let i = 0; i < 25; i++) {
		const url = `https://businesssearchapi.ohiosos.gov/Rtj0lqmmno6vaBwbRxU7TunJY6RmAt0bipK${startingId + i}?_=1590620350441`;

		try {
			const axiosResponse = await axios.get(url, {
				headers: {
					origin: 'https://businesssearch.ohiosos.gov',
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'
				}
			});
			const businessData = axiosResponse.data.data;
			console.log('Registrant', businessData[1].registrant[0].charter_num, businessData[1].registrant[0].contact_name);
			console.log('First panel', businessData[4].firstpanel[0].business_name, businessData[4].firstpanel[0].effect_date);

			// .registrant[0].effective_date_time,
			// 	axiosResponse.data.data[1].registrant[0].charter_num,
			// 	axiosResponse.data.data[1].registrant[0].effective_date_time,
			// 	axiosResponse.data.data[4].firstPanel[0].business_name
		}
		catch (e) {
			console.log('Error', e.response ? e.response.status : e);
		}

		await timeout(2000);

	}

})();