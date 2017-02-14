"use strict";

const moment = require('moment');
const Browser = require('./browser.js');
const util = require('./util.js');

const Capium = function (config, options) {
	try {
		this.config = config || require('../config.js');
		this.options = options || require('../options.js');
		let isCorrectPagesParam = typeof this.config.pages === 'object' || typeof this.config.pages === 'string';
		let isCorrectCapsParam = typeof this.config.caps === 'object';
		if(!isCorrectPagesParam || !isCorrectCapsParam) {
			util.throwError('both of pages and caps both required.');
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
	} catch(error) {
		util.throwError(error);
	}
};

Capium.prototype = {

	run: function () {
		try {
			this.timestamp = moment.now();
			let cap = this.caps[this.indexOfCap];
			if(this.isIncludedLocalostInURL) {
				cap['browserstack.local'] = 'true';
			}
			this.browser = new Browser(this.pages, cap, this.options, this.timestamp);
			return this.browser.run()
				.then(function () {
					let isLastCap = this.indexOfCap === this.caps.length - 1;
					if(isLastCap) {
						return Promise.resolve();
					} else {
						this.indexOfCap++;
						this.run();
					}
				}.bind(this))
		} catch(error) {
			util.throwError(error);
		}
	}
};

module.exports = Capium;
