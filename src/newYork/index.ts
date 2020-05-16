import axios from 'axios';
import cheerio from 'cheerio';

(async () => {
	const originalCorpId = '5C2AA3435E01ACFD';
	const originalNameId = 'BFA2CA214703D07F';
	const corpId = '5C2AA3435E01ACFD';
	const nameId = 'BFA2CA214703D08F';

	const url = `https://appext20.dos.ny.gov/corp_public/CORPSEARCH.ENTITY_INFORMATION?p_token=E3530B1D378DE879BDDDE3A6FF8D5BA2ED2F63025706E4BB2D498409D9C60EAAF778D31068D920C23AB2C35311B7D980&p_nameid=${nameId}&p_corpid=${corpId}&p_captcha=18709&p_captcha_check=E3530B1D378DE879BDDDE3A6FF8D5BA2ED2F63025706E4BB2D498409D9C60EAABAF7C03866FC733DD402E7CCC12564DA&p_entity_name=capital%20partners&p_name_type=A&p_search_type=CONTAINS`;

	const axiosResponse = await axios.get(url);

	const $ = cheerio.load(axiosResponse.data);

	const title = $('center div.highlight').text();
	if (title) {
		console.log('title', title);
	}
	else {
		const messageBox = $('center div.messagebox p').text();
		console.log('message box', messageBox)

	}

})();

const stuff = [
	{
		date: 'march 4',
		corpId: '54ED3C1CB9CC3D79',
		nameId: '1CE53611435BE5F6'
	},
	{
		date: 'march 3',
		corpId: '8BB5C41C9D785D92',
		nameId: '934FF247404738A7'
	},
	{
		date: 'feb 5',
		corpId: '0AA752DF5F045785',
		nameId: '6AA74A46822A4257'
	}
];