"use strict";

const Browser = require('../scripts/browser.js');

const capium = function (settings, options) {
	console.log(process.cwd());

	let promises = [];
	let pages;
	let caps;
	if(typeof settings === 'object') {
		pages = settings.pages || require('../settings/pages.js');
		caps = settings.caps || require('../settings/caps.js');
	} else {
		pages = require('../settings/pages.js');
		caps = require('../settings/caps.js');
	}

	caps.forEach(function (cap) {

		let browser = new Browser(pages, cap, options);
		promises.push(browser.run());
	});

	return Promise.all(promises);
};


module.exports = capium;
