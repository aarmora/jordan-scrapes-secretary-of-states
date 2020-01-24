import { searchBusinesses } from './idaho';
import { timeout } from "./../helpers";
// const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
const alphabet = ["b", "s"];


export async function searchForBusinesses() {
	// Get the date - 1 day
	const date = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString();

	const formattedBusinesses: any[] = [];
	for (let i = 0; i < alphabet.length; i++) {

		const businesses = await searchBusinesses(alphabet[i], date);

		for (let key in businesses) {
			if (businesses.hasOwnProperty(key)) {
				const currentDate = new Date();
				const formattedBusiness = {
					filingDate: businesses[key].FILING_DATE,
					recordNumber: businesses[key].RECORD_NUM,
					agent: businesses[key].AGENT,
					status: businesses[key].STATUS,
					standing: businesses[key].STANDING,
					title: businesses[key].TITLE[0].split('(')[0].trim(),
					state: 'Idaho',
					sosId: businesses[key].ID,
					createdAt: currentDate,
					updatedAt: currentDate
				};
				formattedBusinesses.push(formattedBusiness);
			}
		}

		console.log('formattedBusinesses sample', formattedBusinesses[3], formattedBusinesses[150]);

		// Wait five seconds like good citizens
		await timeout(5000);
	}

	return formattedBusinesses;

}