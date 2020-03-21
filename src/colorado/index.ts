import axios from 'axios';
import cheerio from 'cheerio';

(async () => {

	const id = 20201243843;

	for (let i = 0; i < 20; i++) {
		const increment = 3;
		try {
			await getBusinessDetails(id + (i * increment));
		}
		catch (e) {
			console.log('something broke', id + (i * increment));

		}
	}

})();


async function getBusinessDetails(id: number) {

	const url = `https://www.sos.state.co.us/biz/BusinessEntityDetail.do?quitButtonDestination=BusinessEntityResults&nameTyp=ENT&masterFileId=${id}&srchTyp=ENTITY`;

	const axiosResponse = await axios.get(url, {
		headers: {
			"cookie": "_ga=GA1.3.1381612432.1583500038; TS01f3ddad=01c6cfed7058d3570a7b8344ca028cd52010a1bcf052a882a6195931d8d4801dcbc519811c; _gid=GA1.3.271714947.1584784465; _gcl_au=1.1.1920694888.1584784465; menuheaders=2c; JSESSIONID=0000-lUDWo0hoJF3KBZaTQhz2ky:1b2r5m433; TS01132dd1=01c6cfed70e9ee8af77449cdde2589a53daffb8b6a7e3c32cc35681d8cf2b339e867af342cb703972c8ec98ae365ee36bdf5252efe; TS01132dd1_31=01526889668b923b0ce8fbdc5bbe11681884b4cc6d40141358085bb74c48f95130a2d87e7e0f8e8253f5fff6da0b4baf2c9cf5b86b; TS01132dd1_77=08b7f17dc7ab280060a8e77ff41a702cebf64b14f9b271745c648c87e299d967048fbefd790857a34527f2366b0a851a08c277556d8238006bcd64b36d369c03b866c4d7cb9bf11cc86207c2ca16057ca0063033673c043daefbec33b0fcfc4e998b9c0d9ab1dfafdd374e5b20550eb6"
		}
	});

	const $ = cheerio.load(axiosResponse.data);
	const title = $('form > table >tbody > tr> td>  table > tbody > tr:nth-of-type(1) tr:nth-of-type(2) td:nth-of-type(2)').text();
	const date = $('form > table >tbody > tr> td>  table > tbody > tr:nth-of-type(1) tr:nth-of-type(3) td:nth-of-type(4)').text();
	const status = $('form > table >tbody > tr> td>  table > tbody > tr:nth-of-type(1) tr:nth-of-type(3) td:nth-of-type(2)').text();
	const address = $('form > table >tbody > tr> td>  table > tbody > tr:nth-of-type(1) tr:nth-of-type(6) td:nth-of-type(2)').text();
	const agent = $('form > table >tbody > tr> td>  table > tbody > tr:nth-of-type(7) tr:nth-of-type(2) td:nth-of-type(2)').text();


	const pageMessages = $('#pageMessages .page_messages').text();
	const business = {
		title: title,
		date: date,
		status: status,
		address: address,
		agent: agent,
		id: id
	};

	if (pageMessages) {
		console.log('Looks like not found', pageMessages.trim(), id);
	}
	else {
		console.log('response', business);
	}
}