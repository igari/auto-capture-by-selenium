"use strict";

const capsMac = function (options) {

	return {

		common: {
			"name": this.testName,
			'username': options.sauceLabsId,
			'accessKey': options.sauceLabsPass,
			"screenResolution" : options.resolution || "1024x768",
			"timeZone": "Tokyo",
			"videoUploadOnPass": false,
			"recordVideo": false,
			"recordScreenshots": false,
			"recordLogs": true,
			"captureHtml": false,
			"webdriverRemoteQuietExceptions": false
		},

		browsers: {

			chromeMac: {
				"browserName": "chrome",
				"chromeOptions": this.chromeOptions,
			},
			firefoxMac: {
				"browserName": "firefox",
				'firefox_profile': this.firefoxProfile,
			},
			safari: {
				"browserName": "safari",
				"safariIgnoreFraudWarning": true,
				"safariAllowPopups": false
			},
		}
	}
};

module.exports = capsMac;