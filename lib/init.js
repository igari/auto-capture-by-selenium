"use strict";

const Browser = require('./browser.js');

const Capium = function (config) {
	let isCorrectPagesParam = typeof config.pages === 'object' || typeof config.pages === 'string';
	let isCorrectCapsParam = typeof config.caps === 'object';
	if(!isCorrectPagesParam || !isCorrectCapsParam) {
		throw new Error('both of pages and caps both required.')
	}
	this.config = config || require('../config.js');
	this.pages = this.config.pages instanceof Array ? this.config.pages : [this.config.pages];
	this.caps = this.config.caps instanceof Array ? this.config.caps : [this.config.caps];
	this.isIncludedLocalostInURL = false;

	for(let i = 0, len = this.pages.length; i < len; i++) {
		if(typeof this.pages[i] === 'string') {
			this.pages[i] = { url: this.pages[i] };
		}
		if(this.pages[i].url.match(/^https?:\/\/localhost/)) {
			this.isIncludedLocalostInURL = true;
		}
	}
};

Capium.prototype = {
	run: function () {
		let promises = [];
		this.caps.forEach(function (cap) {
			if(this.isIncludedLocalostInURL) {
				cap['browserstack.local'] = 'true';
			}
			//TODO: 再帰的実行にする、並列実行になってしまうため、オプションで選べるようにする
			this.browser = new Browser(this.pages, cap);
			promises.push(this.browser.run());
		}.bind(this));

		return Promise.all(promises);
	}
};

module.exports = Capium;
