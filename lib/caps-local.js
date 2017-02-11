"use strict";

const capsLocal = function () {

	return {

		browsers: {

			mac: {

				chrome: {
					"browserName": "chrome"
				},
				firefox: {
					"browserName": "firefox"
				},
				safari: {
					"browserName": "safari"
				}
			},

			windows: {

				chrome: {
					"browserName": "chrome"
				},
				firefox: {
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
	}
};

module.exports = capsLocal;