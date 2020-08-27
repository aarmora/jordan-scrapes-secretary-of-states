import cheerio from "cheerio";
import axios from "axios";
import { timeout } from "../helpers";

interface IBusiness {
	title?: string;
	filingDate?: string;
	sosId?: number;
};

(async () => {
	const startingId = 238735;
	for (let i = 0; i < 10; i++) {
		await getDetails(startingId + i);
		await timeout(1000);
	}
})();

async function getDetails(sosId: number) {
	const axiosResponse = await axios.get(`https://hbe.ehawaii.gov/documents/business.html?fileNumber=${sosId}C5`);
	const $ = cheerio.load(axiosResponse.data);
	const title = $("#myTabContent .row div:nth-of-type(1) dl:nth-of-type(1) dd:nth-of-type(1)").text();
	const filingDate = $("#myTabContent .row div:nth-of-type(1) dl:nth-of-type(1) dd:nth-of-type(6)").text();

	console.log("Master Name-", title);
	console.log("Registration Date-", filingDate);


	const business: IBusiness = {};
	business.title = title;
	business.filingDate = filingDate;

	console.log("business", business);
}

