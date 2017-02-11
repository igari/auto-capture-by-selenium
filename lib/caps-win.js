"use strict";

const capsWin = function () {

	return {

		browsers: {

			chromeWin: {
				"browserName": "chrome"
			},
			firefoxWin: {
				"browserName": "firefox"
			},
			ie11: {
				"browserName": "internet explorer"
			},
			edge: {
				"browserName": "MicrosoftEdge"
			}
		}
	}
};

module.exports = capsWin;