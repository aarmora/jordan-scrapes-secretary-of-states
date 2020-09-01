import cheerio from "cheerio";
import axios from "axios";
import { timeout } from "../helpers";

(async () => {
    const startingId = 2177292;
    for (let i = 0; i <= 20; i++) {
        await getDetails(startingId + i);
        //Longer timeout needed because of DDOS protection from website
        await timeout(5000);
    }
})();

async function getDetails(sosId: number) {
    const axiosResponse = await axios.get(`https://ecorp.azcc.gov/BusinessSearch/BusinessInformation?businessId=${sosId}`);
    const $ = cheerio.load(axiosResponse.data);
    const title = $(".data_pannel1 .row:nth-of-type(4) .col-xs-12.col-sm-4").text().replace(/\n/g, "").trim();
    const formationDate = $(".data_pannel1 .row:nth-of-type(6) .col-xs-12:nth-of-type(2)").text().replace(/\n/g, "").trim();
    const status = $(".data_pannel1 .row:nth-of-type(5) .col-xs-12:nth-of-type(4)").text().replace(/\n/g, "").trim();
    const businessType = $(".data_pannel1 .row:nth-of-type(9) .col-xs-12:nth-of-type(2)").text().replace(/\n/g, "").trim();
    const agentName = $(".data_pannel1 .row:nth-of-type(14) .col-xs-12:nth-of-type(2)").text().replace(/\n/g, "").trim();
    const address = $(".data_pannel1 .row:nth-of-type(16) .col-xs-12:nth-of-type(2)").text().replace(/\n/g, "").trim();
    // Has a spot for email but I havent seen any as of yet..
    const email = $(".data_pannel1 .row:nth-of-type(17) .col-xs-12:nth-of-type(4)").text().replace(/\n/g, "").trim();

    const business: any = {};
    business.title = title;
    business.formationDate = formationDate;
    business.sosId = sosId;
    business.status = status;
    business.businessType = businessType;
    business.agentName = agentName;
    business.address = address;
    business.email = email

    console.log("business", business);
}
