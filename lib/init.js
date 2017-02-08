"use strict";

const Browser = require('./browser.js');

const capium = function (config) {

	config = config || require('../config.js');

	let promises = [];
	let pages = config.pages;
	let caps = config.caps;

	caps.forEach(function (cap) {

		//TODO: 再帰的実行にする
		let browser = new Browser(pages, cap);
		promises.push(browser.run());
	});

	return Promise.all(promises);
};


module.exports = capium;
