"use strict";

const Browser = require('../scripts/browser.js');

const capium = function (settings) {
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
		let browser = new Browser(pages, cap);
		browser.run();
	});
};


module.exports = capium;
