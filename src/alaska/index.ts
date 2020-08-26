import cheerio from "cheerio";
import axios from "axios";
import { timeout } from "../helpers";

(async () => {
    //Id of 10140861 starts at date of 8/21/2020 
     const startingId = 10140861;
     for (let i = 0; i < 1000; i+=50) {
         await getDetails(startingId + i);
         //Needed longer than 1 sec timeout due to being IP blocked.
         await timeout(10000);
     }
})();

async function getDetails(sosId: number) {
    // URL looks like this in the production website https://www.commerce.alaska.gov/cbp/main/Search/EntityDetail/10063361?_=1597181120369
    // The query parameter was not needed.
    const axiosResponse = await axios.get(`https://www.commerce.alaska.gov/cbp/main/Search/EntityDetail/${sosId}`, {
        headers: {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36",
            // Neither cookie nor host was required.
            // cookie: "TScf54ea41077=0890181cafab28006f32628354d352cf523378cc63639069784b9247c73d1e00d516ce4acca56ad0182231c1478e480a08e5d42c4e1720003a8ef360360de55429873b58ef7153195bc458803f992eb4ae2f45f50cd5ec02; TS00000000076=0890181cafab2800a900e3bb2c1075810764ca4d062d0881168269945bb69ad86f268c3860dce7984c4dcb6e5c9550c408ed934d4209d000f2178c6b0e403595484031cf550851dc6a41517cf4204434fb441f7923689c17055b3221df463c3359c5687140f4b69875db34433b99fb1f1f7a776f68b71b8581f6d91f6864a14dcd042d34019798c1c51bedf855cb68e133518ffb83c94c9e2c424f8c8bf6928bd9429b2a71679f084c4bc1a54915c8344aa974b51facc337a52787fb8efd8bb92678eb42d6319595dc4df1cfbacd78969137b575051b02f4ab6fadb2f76ca9de37b5710df929e08e872125c5311bf679e287df2a122e9d9a00a9c4cd0f41c42cbd9109f086bc0983; TSPD_101_DID=0890181cafab2800a900e3bb2c1075810764ca4d062d0881168269945bb69ad86f268c3860dce7984c4dcb6e5c9550c408ed934d42063800da851031b38161ee6213d0618e8c1b768a0158cdd17df5e9e572dea3059211b5a596a4959255c70ffcb61db7dd4f2c007a0169b1cda20e13; TSPD_101=0890181cafab28002fbbf9a9e5e4c77c0a8d7fcaf472145610a06e434d636b12a41145f4c4d0f14618bec011c9fe60e908f3a5e63d0518005776f8ee4dcd81c3ab1015171ce637040290eefc16315a46; TS3c5043ea027=0890181cafab200011e914c8733c1300599ca12d5744ee76ede88fe49896a67b7162201a4eaa186908e17a76781130007e2515bad27bee4104771485c1c52800a12ee9ab88d8ce7b7ecf901e33be2c6e24855cc7123867a72fc5096444b0a02e",
            // host: "www.commerce.alaska.gov",
            referer: "https://www.commerce.alaska.gov/cbp/main/search/entities"
        }
    });
    const $ = cheerio.load(axiosResponse.data);

    const title = $("h2 + table:nth-of-type(1) tr:nth-of-type(1) td:nth-of-type(2)").text();
    const filingDate = $("dl:nth-of-type(1) dd:nth-of-type(4)").text();

    const business: any = {};
    business.title = title;
    business.filingDate = filingDate;
    business.sosId = sosId;

    console.log("business", business);
}