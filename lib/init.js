"use strict";

const Browser = require('./browser.js');

const capium = function (config) {

	config = config || require('../config.js');

	let promises = [];
	let pages = config.pages instanceof Array ? config.pages : [config.pages];
	let caps = config.caps instanceof Array ? config.caps : [config.caps];

	caps.forEach(function (cap, index) {

		//TODO: 再帰的実行にする
		let browser = new Browser(pages, cap);
		promises.push(browser.run(index));
	});

	return Promise.all(promises);
};


module.exports = capium;
