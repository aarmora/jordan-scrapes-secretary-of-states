import cheerio from "cheerio";
import axios from "axios";
import { timeout } from "../helpers";

(async () => {
    const startingId = 566000;
    for (let i = 0; i <= 20; i += 1) {
        await getDetails(startingId + i);
        //Longer timeout needed because of protection from website
        await timeout(3000);
    }
})();

async function getDetails(sosId: number) {
    const axiosResponse = await axios.get(`https://www.sos.arkansas.gov/corps/search_corps.php?DETAIL=${sosId}`);
    const $ = cheerio.load(axiosResponse.data);
    const title = $("tr:nth-of-type(2) td:nth-of-type(2)").text();
    const formationDate = $("tr:nth-of-type(11) td:nth-of-type(2)").text();
    const status = $("tr:nth-of-type(7) td:nth-of-type(2)").text();
    const agentName = $("tr:nth-of-type(9) td:nth-of-type(2)").text();
    const address = $("tr:nth-of-type(8) td:nth-of-type(2)").text();


    const business: any = {};
    business.title = title;
    business.formationDate = formationDate;
    business.sosId = sosId;
    business.status = status;
    business.agentName = agentName;
    business.address = address;

    console.log("business", business);
}
