"use strict";

const capsLocal = function () {

	return {

		browsers: {

			mac: {

				chrome: {
					"browserName": "chrome",
					"chromeOptions": this.cap.chromeOptions,
				},
				firefox: {
					"browserName": "firefox",
					'firefox_profile': null,
				},
				safari: {
					"browserName": "safari",
					"safariIgnoreFraudWarning": true,
					"safariAllowPopups": false
				}
			},

			windows: {

				chrome: {
					"browserName": "chrome",
					"chromeOptions": this.cap.chromeOptions,
				},
				firefox: {
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
	}
};

module.exports = capsLocal;