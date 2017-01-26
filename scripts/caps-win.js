"use strict";

const capsWin = function (options) {

	return {

		browsers: {

			chromeWin: {
				"browserName": "chrome",
				"chromeOptions": this.chromeOptions,
			},
			firefoxWin: {
				"browserName": "firefox",
				'firefox_profile': null,
			},
			ie11: {
				"browserName": "internet explorer",
				"version": "latest",
				"platform": "Windows 10",
			},
			edge: {
				"browserName": "MicrosoftEdge",
				"version": "14.14393",
				"platform": "Windows 10",
			}
		}
	}
};

module.exports = capsWin;