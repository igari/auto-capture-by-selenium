"use strict";

const selenium = require('selenium-standalone');
const capium = require('../scripts/capium.js');
const options = {
	baseURL: 'https://selenium-release.storage.googleapis.com',
	version: '3.0.1',
	drivers: {
		chrome: {
			version: '2.27',
			arch: process.arch,
			baseURL: 'https://chromedriver.storage.googleapis.com'
		},
		ie: {
			version: '3.0.0',
			arch: process.arch,
			baseURL: 'https://selenium-release.storage.googleapis.com'
		},
		firefox: {
			version: '0.13.0',
			arch: process.arch,
			baseURL: 'https://github.com/mozilla/geckodriver/releases/download'
		}
	},
	logger: function(message) {
		console.log(message);
	},
	progressCb: function(totalLength, progressLength, chunkLength) {
		console.log(totalLength, progressLength, chunkLength);
	}
};

const exe = function (settings) {
	selenium.install(options, function () {
		selenium.start(options, function (err, child) {
			capium(settings, options).then(function () {
				if(err) throw err;
				child.kill();
			});
		})
	});
};

module.exports = exe;