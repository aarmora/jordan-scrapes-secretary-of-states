import cheerio from "cheerio";
import axios from "axios";
import { timeout } from "../helpers";

(async () => {
     const startingId = 642999;
     for (let i = 0; i < 1000; i+=50) {
         await getDetails(startingId + i);
         await timeout(1000);
     }
})();

const business: any = {};

async function getDetails(sosId: number) {
    const axiosResponse = await axios.get(`http://arc-sos.state.al.us/cgi/corpdetail.mbr/detail?corp=${sosId}&page=date&file=`);
    const $ = cheerio.load(axiosResponse.data);
    
    const title = $("thead:nth-of-type(1) tr:first-child td:first-child").text();
    business.title = title.trim();
    const informationFields = $("#block-sos-content tr ");
    for (let i = 0; i < informationFields.length; i++) {
        const cells$ = cheerio.load(informationFields[i]);
        const label = cells$(".aiSosDetailDesc").text();
        const value = cells$(".aiSosDetailValue").text();

        switch (label) {
            case 'Entity ID Number':
                business.idNumber = value;
                break;
            case 'Formation Date':
                business.formationDate = value.replace(/\n/g, "").trim();
                break;
            case 'Registered Office Street Address':
                business.address = value.trim();
                break;
            case 'Registered Agent Name':
                business.agentName = value.replace(/\n/g, "").trim();
                break;
                // Qualify date varies widely compared to formation date when it is a foreign business
            case 'Qualify Date':
                business.qualifyDate = value;
                break;
            case 'Entity Type':
                business.entityType = value;
                break;
            default:
                break;
        }
    }
    console.log("business",business);
}
