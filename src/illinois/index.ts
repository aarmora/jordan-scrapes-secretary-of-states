import axios from 'axios';
import cheerio from 'cheerio';

(async () => {
	const url = `https://www.ilsos.gov/corporatellc/CorporateLlcController`;
	const body = {
		chewy: 296213,
		banquo: 10568365,
		command: 'details'
	};

	const axiosResponse = await axios.post(url, body,
		{
			headers: {
				'Cookie': 'JSESSIONID=00011WVcmZQIZrazerCxap5UiRe:15rk6cbeg; __utma=94661572.1324655630.1589544452.1589544452.1589544452.1; __utmc=94661572; __utmz=94661572.1589544452.1.1.utmcsr=cyberdriveillinois.com|utmccn=(referral)|utmcmd=referral|utmcct=/departments/business_services/corp.html; __utmt=1; __utmb=94661572.7.10.1589544452',
				'Origin': 'https://www.ilsos.gov'
			}
		});

	const $ = cheerio.load(axiosResponse.data);

	const title = $('.display-details div:nth-of-type(2) .col-sm-8.col-md-10').text();

	console.log('title', title, $('h4').text());


})();