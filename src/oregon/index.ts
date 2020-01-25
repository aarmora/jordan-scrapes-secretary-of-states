import { searchBusinesses, getBusinessInformation } from "../oregon/oregon";
const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];


(async () => {

	const links: string[] = [];
	const businesses: any[] = [];
	for (let i = 0; i < alphabet.length; i++) {
		await searchBusinesses(alphabet[i], links);
	}

	for (let i = 0; i < links.length; i++) {
		const business = await getBusinessInformation(links[i]);

		businesses.push(business);
	}



})();