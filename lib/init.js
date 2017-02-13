"use strict";

const Browser = require('./browser.js');

const Capium = function (config) {
	this.config = config || require('../config.js');
	let isCorrectPagesParam = typeof this.config.pages === 'object' || typeof this.config.pages === 'string';
	let isCorrectCapsParam = typeof this.config.caps === 'object';
	if(!isCorrectPagesParam || !isCorrectCapsParam) {
		throw new Error('both of pages and caps both required.')
	}
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
	this.indexOfCap = 0;
};

Capium.prototype = {

	run: function () {
		return new Promise(function (resolve) {
			let cap = this.caps[this.indexOfCap];
			if(this.isIncludedLocalostInURL) {
				cap['browserstack.local'] = 'true';
			}
			this.browser = new Browser(this.pages, cap);
			this.browser.run()
				.then(function () {
					let isLastCap = this.indexOfCap === this.caps.length - 1;
					if(isLastCap) {
						resolve();
					} else {
						this.indexOfCap++;
						this.run();
					}
				}.bind(this))
		}.bind(this));
	}
};

module.exports = Capium;
