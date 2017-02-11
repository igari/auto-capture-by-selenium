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
};

Capium.prototype = {
	run: function () {
		let promises = [];
		this.caps.forEach(function (cap) {
			//TODO: 再帰的実行にする
			this.browser = new Browser(this.pages, cap);
			promises.push(this.browser.run());
		}.bind(this));

		return Promise.all(promises);
	}
};

module.exports = Capium;
