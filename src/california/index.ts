import axios from 'axios';
import cheerio from 'cheerio';
import { timeout } from '../helpers';

(async () => {
	const url = 'https://businesssearch.sos.ca.gov/CBS/Detail';
	// Id ceiling as of 02/21/2020 - 4562055

	// Numbers start here after big break - 4522201
	// Date starts randomly at 03/06/2019

	// Numbers end here for a big break - 4327745
	// Date stops around 10/23/2019


	const startingEntityId = 4562000;

	for (let i = 0; i < 100; i++) {

		const body = `__RequestVerificationToken=kvKWWWpQReRQhUaK5gKaj5e39FlOYQRuHoROdgstUQFtZMQdDrKEVVBP8k0Q-ZlGAHy8e7YMh4SXEt9mcvASYgytw-E1&SearchType=CORP&SearchCriteria=a&SearchSubType=Keyword&filing=&enitityTable_length=10&EntityId=0${startingEntityId + i}`;

		const axiosResponse = await axios.post(url, body, {
			headers:
			{
				'Referer': 'https://businesssearch.sos.ca.gov/CBS/SearchResults?filing=&SearchType=CORP&SearchCriteria=a&SearchSubType=Keyword',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
				'cookie': 'visid_incap_992756=UYJVNFkLR36DcGXJ3uKeD6tGT14AAAAAQUIPAAAAAAAlSfLf32PEO+bejQTnFqXJ; nlbi_992756=QLAYUB3h33aPqV8coj3WLQAAAAAbdvl6CmxsCba6WUXI+GQ9; incap_ses_724_992756=KGyFVCVZ/Gx4BVZlTysMCqxGT14AAAAAohsd3BEiWgmzW05qx+nIKA==; _ga=GA1.2.1977986284.1582253741; _gid=GA1.2.1859273065.1582253741; visid_incap_1000181=f3uCFO+ZTyq7CmO4aKOGfLFGT14AAAAAQUIPAAAAAAAb8rKfKc5uHMSr7YMK7JvE; ai_user=E1zKI|2020-02-21T02:55:46.915Z; __RequestVerificationToken=sSh_tTeIdfqWrG7ST-BI3f2Pu_WG-tjvA3NAZlVBCOiLN3WvZH6RqYPZ-TzrDNSLriQ0ejGtU9X42j2r6EU3ktMekrA1; nlbi_1000181=kabxFULIpDpvimhSowdtbQAAAABQKcDnnI8dtQEki2DnMyR6; ARRAffinity=aaca3866bf2684de4e3f67aa207c3eb6381f25edaa6d29022160c2d8f573c6fc; incap_ses_226_1000181=P1YxJ0t5TmVmiVh31OkiA3TQT14AAAAADGEynb/O5CknJ7n7KJcFNA==; _gat=1; ai_session=cgmyT|1582289014506.865|1582289014506.865'
			}
		});

		const $ = cheerio.load(axiosResponse.data);

		const businessTitle = $('.col-md-12 h2').text();

		const pageTitle = $('title').text();

		const html = $('html').text();

		const date = $('#maincontent div:nth-of-type(3) div:nth-of-type(2)').text();
		const status = $('#maincontent div:nth-of-type(6) div:nth-of-type(2)').text();

		const businessListing = {
			filingDate: formatText($('#maincontent div:nth-of-type(3) div:nth-of-type(2)').text()),
			status: formatText($('#maincontent div:nth-of-type(6) div:nth-of-type(2)').text()),
			formedIn: formatText($('#maincontent div:nth-of-type(4) div:nth-of-type(2)').text()),
			agent: formatText($('#maincontent div:nth-of-type(7) div:nth-of-type(2)').text()),
			physicalAddress: formatText($('#maincontent div:nth-of-type(8) div:nth-of-type(2)').text()),
			mailingAddress: formatText($('#maincontent div:nth-of-type(9) div:nth-of-type(2)').text()),
			title: businessTitle.replace(`C${startingEntityId + i}`, '').replace(/\n/g, '').trim()
		};

		console.log('Business', businessListing);

		await timeout(1000);
	}

})();

function formatText(text: string) {
	return text.replace(/\n/g, '').replace('Entity Mailing City, State, Zip', '')
		.replace('Entity City, State, Zip', '')
		.replace('Entity Mailing Address', '').replace('Entity Address', '').trim();
}

function formatBusinessTitle(title: string, id: string) {
	if (title.includes('/\n/')) {
		return title.replace(`C${id}`, '').replace('\n', '').trim();
	}
	else {
		return title.replace(`C${id}`, '').trim();
	}
}