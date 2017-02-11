"use strict";

const capsMac = function () {

	return {

		common: {
			"name": this.cap.name,
			"screenResolution" : this.cap.resolution || "1024x768",
			"timeZone": this.cap['timeZone'] || this.cap.timezone,
			"videoUploadOnPass": false,
			"recordVideo": false,
			"recordScreenshots": false,
			"recordLogs": true,
			"captureHtml": false,
			"webdriverRemoteQuietExceptions": false
		},

		browsers: {

			chrome: {
				"browserName": "chrome"
			},
			firefox: {
				"browserName": "firefox"
			},
			safari: {
				"browserName": "safari"
			},
		}
	}
};

module.exports = capsMac;