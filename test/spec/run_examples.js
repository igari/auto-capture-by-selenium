const os = /^win/.test(process.platform) ? 'windows' : 'mac';
const path = require('path');
const assert = require('assert');

describe(`test on ${os} from require`, function () {
	this.timeout(60*60*1000);
	let testFiles = [];
	switch(os) {
		case 'mac':
			testFiles = [
				'chrome.js',
				'chrome-with-webdriver-code.js',
				'firefox.js',
				'safari.js'
			];
			break;
		case 'windows':
			testFiles = [
				'chrome.js',
				'chrome-with-webdriver-code.js',
				'edge.js',
				'firefox.js',
				'ie11.js'
			];
			break;
	}
	testFiles.forEach(function (exampleFileName) {
		it(exampleFileName, function () {
			return require(path.join(process.cwd(), './examples/', exampleFileName))
				.catch(function (error) {
					assert(false, typeof error === 'string' ? error : error.message);
				})
		})
	});
});