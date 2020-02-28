import axios, { AxiosResponse } from 'axios';
import cheerio from 'cheerio';
import { viewState } from './viewState';
import Client from '@infosimples/node_two_captcha';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client(process.env.capatchaApiKey, {
	timeout: 60000,
	polling: 5000,
	throwErrors: false
});

(async () => {

	// for (let i = 0; i < 2000; i += 100) {
	// 	await getEntityData(7487440 + i);
	// }

	// await getEntityData(7487440, viewState);
	await getInitialFormData(7487440);

	// await tester();
})();

// This initial form. We can't submit this without the viewState and captcha. We'll then submit it in another function
async function getInitialFormData(entityNumber: number) {
	const getUrl = 'https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx';

	const axiosResponse = await axios.get(getUrl);

	const $ = cheerio.load(axiosResponse.data);

	const viewState = $('#__VIEWSTATE').val();
	const viewStateGenerator = $('#__VIEWSTATEGENERATOR').val();
	let cookie = axiosResponse.headers['set-cookie'][0];
	cookie = cookie ? cookie.split(';')[0] : '';

	let captchaUrl = $('#ctl00_ContentPlaceHolder1_ctl05_RadCaptcha1_CaptchaImageUP').attr('src');

	captchaUrl = captchaUrl.replace('..', 'https://icis.corp.delaware.gov/Ecorp');
	const captchaResponse = await client.decode({
		url: captchaUrl
	});

	await submitEntitySearch(entityNumber, viewState, viewStateGenerator, captchaResponse._text, cookie);

}

// Here we are POSTing the form. It returns the intial form AND a list of results
async function submitEntitySearch(entityNumber: number, viewState: string, viewStateGenerator: string, captchaText: string, cookie: string) {

	const url = 'https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx';

	const formData = `__EVENTTARGET=&__EVENTARGUMENT=&__VIEWSTATE=${viewState}&__VIEWSTATEGENERATOR=${viewStateGenerator}&ctl00%24hdnshowlogout=&ctl00%24hdnfilingtype=&as_sitesearch=&ctl00%24ContentPlaceHolder1%24frmEntityName=&ctl00%24ContentPlaceHolder1%24frmFileNumber=${entityNumber.toString()}&ctl00%24ContentPlaceHolder1%24hdnPostBackSource=&ctl00%24ContentPlaceHolder1%24lblMessage=&ctl00_ContentPlaceHolder1_ctl05_rfdacc1_ClientState=&ctl00_ContentPlaceHolder1_ctl05_RadCaptcha1_ClientState=&ctl00%24ContentPlaceHolder1%24ctl05%24rcTextBox1=${captchaText}&ctl00%24ContentPlaceHolder1%24btnSubmit=Search`


	console.log('formdata', formData);

	let axiosResponse: AxiosResponse;
	console.log('cookie', cookie);

	try {

		axiosResponse = await axios.post(url, formData, {
			headers:
			{
				'Referer': 'https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
				'cookie': cookie,
				'Host': 'icis.corp.delaware.gov',
				'Origin': 'https://icis.corp.delaware.gov'
			}
		});
	}
	catch (e) {
		console.log('axios post error', e.response.status);
		throw 'broke';
	}
	const $ = cheerio.load(axiosResponse.data);
	const entityName = $('#ctl00_ContentPlaceHolder1_rptSearchResults_ctl00_lnkbtnEntityName').text();
	const fileNumber = $('#ctl00_ContentPlaceHolder1_rptSearchResults_ctl00_lblFileNumber').text();
	const tblResults = $('#bodyTable').text();

	console.log('entityName', entityName, fileNumber);

	const thisViewState = $('#__VIEWSTATE').val();
	const thisViewStateGenerator = $('#__VIEWSTATEGENERATOR').val();

	// await getEntityData(entityNumber, thisViewState, thisViewStateGenerator);

}

// This will return the actual details page. We 
async function getEntityData(entityNumber: number, viewState: string, viewStateGenerator: string) {

	const formData = `__EVENTTARGET=ctl00%24ContentPlaceHolder1%24rptSearchResults%24ctl00%24lnkbtnEntityName&__EVENTARGUMENT=&__VIEWSTATE=${viewState}&__VIEWSTATEGENERATOR=${viewStateGenerator}&ctl00%24hdnshowlogout=&ctl00%24hdnfilingtype=&as_sitesearch=&ctl00%24ContentPlaceHolder1%24frmEntityName=&ctl00%24ContentPlaceHolder1%24frmFileNumber=${entityNumber}`;

	const url = 'https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx';

	let axiosResponse: AxiosResponse;

	try {

		axiosResponse = await axios.post(url, formData, {
			headers:
			{
				'Referer': 'https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36'
			}
		});
	}
	catch (e) {
		console.log('axios post error', e.response.status);
		throw 'broke';
	}

	const $ = cheerio.load(axiosResponse.data);

	const date = $('#ctl00_ContentPlaceHolder1_lblIncDate').text();
	const name = $('#ctl00_ContentPlaceHolder1_lblEntityName').text();

	console.log('date', date, name, entityNumber);

}


async function tester() {

	const formData = `__EVENTTARGET=ctl00%24ContentPlaceHolder1%24rptSearchResults%24ctl00%24lnkbtnEntityName&__VIEWSTATE=%2FwEPDwUKLTk3Nzk4MjcyOQ9kFgJmD2QWAgIDD2QWBAIED2QWAgIBD2QWAmYPDxYCHgRUZXh0ZWRkAgUPZBYMAgEPFgIeB1Zpc2libGVoZAIEDw8WAh8AZRYCHgVTdHlsZQUNZGlzcGxheTpub25lO2QCDg8PFgIfAGVkZAISD2QWAgIBD2QWBgIBD2QWAmYPFCsAAg8WBh8ABQdEZWZhdWx0HwFoHhNjYWNoZWRTZWxlY3RlZFZhbHVlZGQQFhVmAgECAgIDAgQCBQIGAgcCCAIJAgoCCwIMAg0CDgIPAhACEQISAhMCFBYVFCsAAg8WBh8ABQVCbGFjax4FVmFsdWUFBUJsYWNrHghTZWxlY3RlZGhkZBQrAAIPFgYfAAUPQmxhY2tNZXRyb1RvdWNoHwQFD0JsYWNrTWV0cm9Ub3VjaB8FaGRkFCsAAg8WBh8ABQlCb290c3RyYXAfBAUJQm9vdHN0cmFwHwVoZGQUKwACDxYGHwAFB0RlZmF1bHQfBAUHRGVmYXVsdB8FZ2RkFCsAAg8WBh8ABQRHbG93HwQFBEdsb3cfBWhkZBQrAAIPFgYfAAUITWF0ZXJpYWwfBAUITWF0ZXJpYWwfBWhkZBQrAAIPFgYfAAUFTWV0cm8fBAUFTWV0cm8fBWhkZBQrAAIPFgYfAAUKTWV0cm9Ub3VjaB8EBQpNZXRyb1RvdWNoHwVoZGQUKwACDxYGHwAFCk9mZmljZTIwMDcfBAUKT2ZmaWNlMjAwNx8FaGRkFCsAAg8WBh8ABQ9PZmZpY2UyMDEwQmxhY2sfBAUPT2ZmaWNlMjAxMEJsYWNrHwVoZGQUKwACDxYGHwAFDk9mZmljZTIwMTBCbHVlHwQFDk9mZmljZTIwMTBCbHVlHwVoZGQUKwACDxYGHwAFEE9mZmljZTIwMTBTaWx2ZXIfBAUQT2ZmaWNlMjAxMFNpbHZlch8FaGRkFCsAAg8WBh8ABQdPdXRsb29rHwQFB091dGxvb2sfBWhkZBQrAAIPFgYfAAUEU2lsax8EBQRTaWxrHwVoZGQUKwACDxYGHwAFBlNpbXBsZR8EBQZTaW1wbGUfBWhkZBQrAAIPFgYfAAUGU3Vuc2V0HwQFBlN1bnNldB8FaGRkFCsAAg8WBh8ABQdUZWxlcmlrHwQFB1RlbGVyaWsfBWhkZBQrAAIPFgYfAAUFVmlzdGEfBAUFVmlzdGEfBWhkZBQrAAIPFgYfAAUFV2ViMjAfBAUFV2ViMjAfBWhkZBQrAAIPFgYfAAUHV2ViQmx1ZR8EBQdXZWJCbHVlHwVoZGQUKwACDxYGHwAFCFdpbmRvd3M3HwQFCFdpbmRvd3M3HwVoZGQPFhVmZmZmZmZmZmZmZmZmZmZmZmZmZmYWAQV3VGVsZXJpay5XZWIuVUkuUmFkQ29tYm9Cb3hJdGVtLCBUZWxlcmlrLldlYi5VSSwgVmVyc2lvbj0yMDE4LjIuNzEwLjM1LCBDdWx0dXJlPW5ldXRyYWwsIFB1YmxpY0tleVRva2VuPTEyMWZhZTc4MTY1YmEzZDQWLmYPDxYEHghDc3NDbGFzcwUJcmNiSGVhZGVyHgRfIVNCAgJkZAIBDw8WBB8GBQlyY2JGb290ZXIfBwICZGQCAg8PFgYfAAUFQmxhY2sfBAUFQmxhY2sfBWhkZAIDDw8WBh8ABQ9CbGFja01ldHJvVG91Y2gfBAUPQmxhY2tNZXRyb1RvdWNoHwVoZGQCBA8PFgYfAAUJQm9vdHN0cmFwHwQFCUJvb3RzdHJhcB8FaGRkAgUPDxYGHwAFB0RlZmF1bHQfBAUHRGVmYXVsdB8FZ2RkAgYPDxYGHwAFBEdsb3cfBAUER2xvdx8FaGRkAgcPDxYGHwAFCE1hdGVyaWFsHwQFCE1hdGVyaWFsHwVoZGQCCA8PFgYfAAUFTWV0cm8fBAUFTWV0cm8fBWhkZAIJDw8WBh8ABQpNZXRyb1RvdWNoHwQFCk1ldHJvVG91Y2gfBWhkZAIKDw8WBh8ABQpPZmZpY2UyMDA3HwQFCk9mZmljZTIwMDcfBWhkZAILDw8WBh8ABQ9PZmZpY2UyMDEwQmxhY2sfBAUPT2ZmaWNlMjAxMEJsYWNrHwVoZGQCDA8PFgYfAAUOT2ZmaWNlMjAxMEJsdWUfBAUOT2ZmaWNlMjAxMEJsdWUfBWhkZAINDw8WBh8ABRBPZmZpY2UyMDEwU2lsdmVyHwQFEE9mZmljZTIwMTBTaWx2ZXIfBWhkZAIODw8WBh8ABQdPdXRsb29rHwQFB091dGxvb2sfBWhkZAIPDw8WBh8ABQRTaWxrHwQFBFNpbGsfBWhkZAIQDw8WBh8ABQZTaW1wbGUfBAUGU2ltcGxlHwVoZGQCEQ8PFgYfAAUGU3Vuc2V0HwQFBlN1bnNldB8FaGRkAhIPDxYGHwAFB1RlbGVyaWsfBAUHVGVsZXJpax8FaGRkAhMPDxYGHwAFBVZpc3RhHwQFBVZpc3RhHwVoZGQCFA8PFgYfAAUFV2ViMjAfBAUFV2ViMjAfBWhkZAIVDw8WBh8ABQdXZWJCbHVlHwQFB1dlYkJsdWUfBWhkZAIWDw8WBh8ABQhXaW5kb3dzNx8EBQhXaW5kb3dzNx8FaGRkAgMPDxYIHhVFbmFibGVFbWJlZGRlZFNjcmlwdHNnHhxFbmFibGVFbWJlZGRlZEJhc2VTdHlsZXNoZWV0Zx4SUmVzb2x2ZWRSZW5kZXJNb2RlCylyVGVsZXJpay5XZWIuVUkuUmVuZGVyTW9kZSwgVGVsZXJpay5XZWIuVUksIFZlcnNpb249MjAxOC4yLjcxMC4zNSwgQ3VsdHVyZT1uZXV0cmFsLCBQdWJsaWNLZXlUb2tlbj0xMjFmYWU3ODE2NWJhM2Q0Ah4XRW5hYmxlQWpheFNraW5SZW5kZXJpbmdoFgIeBXN0eWxlBQ1kaXNwbGF5Om5vbmU7ZAIFDxQrAAMPFgYfCGcfCgsrBAEfC2hkFgQeC0N1cnJlbnRHdWlkBSRkMzhjMzQxMC05MTM4LTRjZTEtOGI5My01MzAzYWIyYmNlOTQeCVVzZXJFbnRyeQUFVTFMV1kUKwADFgIfAWgWAh8BaGQWAgIBD2QWDGYPZBYCZg9kFghmDw8WCh4GSGVpZ2h0GwAAAAAAAElAAQAAAB4FV2lkdGgbAAAAAACAZkABAAAAHwZlHghJbWFnZVVybAVcfi9UZWxlcmlrLldlYi5VSS5XZWJSZXNvdXJjZS5heGQ%2FdHlwZT1yY2EmaXNjPXRydWUmZ3VpZD1kMzhjMzQxMC05MTM4LTRjZTEtOGI5My01MzAzYWIyYmNlOTQfBwKCA2RkAgEPDxYCHwAFEkdlbmVyYXRlIE5ldyBJbWFnZRYCHgV0aXRsZQUSR2VuZXJhdGUgTmV3IEltYWdlZAICDxYGHglpbm5lcmh0bWwFDkdldCBBdWRpbyBDb2RlHgRocmVmBWR%2BL1RlbGVyaWsuV2ViLlVJLldlYlJlc291cmNlLmF4ZD90eXBlPWNhaCZhbXA7aXNjPXRydWUmYW1wO2d1aWQ9ZDM4YzM0MTAtOTEzOC00Y2UxLThiOTMtNTMwM2FiMmJjZTk0HwFnZAIDDxYEHxMFE0Rvd25sb2FkIEF1ZGlvIENvZGUfFAVkfi9UZWxlcmlrLldlYi5VSS5XZWJSZXNvdXJjZS5heGQ%2FdHlwZT1jYWgmYW1wO2lzYz10cnVlJmFtcDtndWlkPWQzOGMzNDEwLTkxMzgtNGNlMS04YjkzLTUzMDNhYjJiY2U5NGQCAQ8PFgofDxsAAAAAAABJQAEAAAAfEBsAAAAAAIBmQAEAAAAfBmUfEQVcfi9UZWxlcmlrLldlYi5VSS5XZWJSZXNvdXJjZS5heGQ%2FdHlwZT1yY2EmaXNjPXRydWUmZ3VpZD1kMzhjMzQxMC05MTM4LTRjZTEtOGI5My01MzAzYWIyYmNlOTQfBwKCA2RkAgIPFgQfEwUOR2V0IEF1ZGlvIENvZGUfFAVkfi9UZWxlcmlrLldlYi5VSS5XZWJSZXNvdXJjZS5heGQ%2FdHlwZT1jYWgmYW1wO2lzYz10cnVlJmFtcDtndWlkPWQzOGMzNDEwLTkxMzgtNGNlMS04YjkzLTUzMDNhYjJiY2U5NGQCAw8WBB8TBRNEb3dubG9hZCBBdWRpbyBDb2RlHxQFZH4vVGVsZXJpay5XZWIuVUkuV2ViUmVzb3VyY2UuYXhkP3R5cGU9Y2FoJmFtcDtpc2M9dHJ1ZSZhbXA7Z3VpZD1kMzhjMzQxMC05MTM4LTRjZTEtOGI5My01MzAzYWIyYmNlOTRkAgQPZBYCZg8WBB8SBRdNaXNzaW5nIEJyb3dzZXIgUGx1Zy1Jbh8TBRdNaXNzaW5nIEJyb3dzZXIgUGx1Zy1JbmQCBQ9kFgRmDw8WCh8GZR4JQWNjZXNzS2V5ZR4IVGFiSW5kZXgBAAAeB1Rvb2xUaXBlHwcCAmRkAgEPDxYGHwZlHwAFHFR5cGUgdGhlIGNvZGUgZnJvbSB0aGUgaW1hZ2UfBwICZGQCFg8WAh8TZWQCGA9kFgICAQ8WAh4LXyFJdGVtQ291bnQCARYCZg9kFgQCAQ8PFgIfAAUHNzQ4NzQ0MGRkAgMPDxYEHwAFDUExMDk5Lk9SRyBMTEMeD0NvbW1hbmRBcmd1bWVudAUHNzQ4NzQ0MBYCHgdkYXRhLWNhBQVGYWxzZWQYAwUeX19Db250cm9sc1JlcXVpcmVQb3N0QmFja0tleV9fFgMFD2N0bDAwJGltZ0xvZ291dAUnY3RsMDAkQ29udGVudFBsYWNlSG9sZGVyMSRjdGwwNSRyZmRhY2MxBStjdGwwMCRDb250ZW50UGxhY2VIb2xkZXIxJGN0bDA1JFJhZENhcHRjaGExBStjdGwwMCRDb250ZW50UGxhY2VIb2xkZXIxJGN0bDA1JFJhZENhcHRjaGExDxQrAAIFJGQzOGMzNDEwLTkxMzgtNGNlMS04YjkzLTUzMDNhYjJiY2U5NAYAAAAAAAAAAGQFK2N0bDAwJENvbnRlbnRQbGFjZUhvbGRlcjEkY3RsMDUkU2tpbkNob29zZXIPFCsAAgUHRGVmYXVsdAUHRGVmYXVsdGRrGcS4bkofzgMzIgYrdO3P0%2BbFSg%3D%3D`;

	const url = 'https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx';

	let axiosResponse: AxiosResponse;

	try {

		axiosResponse = await axios.post(url, formData, {
			headers:
			{
				'Referer': 'https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36'
			}
		});
	}
	catch (e) {
		console.log('axios post error', e.response.status);
		throw 'broke';
	}

	const $ = cheerio.load(axiosResponse.data);

	const date = $('#ctl00_ContentPlaceHolder1_lblIncDate').text();
	const name = $('#ctl00_ContentPlaceHolder1_lblEntityName').text();

	console.log('date', date, name);

	// console.log('bodyTable', bodyTable);

}

