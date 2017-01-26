"use strict";

const capsSauceLabs = function (options) {

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
				"version": "latest",
				"platform": "OS X 10.9",
				"chromeOptions": this.chromeOptions,
			},
			chromeWin: {
				"browserName": "chrome",
				"version": "latest",
				"platform": "Windows 10",
				"chromeOptions": this.chromeOptions,
			},
			firefoxWin: {
				"browserName": "firefox",
				"version": "latest",
				"platform": "Windows 10",
				'firefox_profile': null,
			},
			firefoxMac: {
				"browserName": "firefox",
				"version": "latest",
				"platform": "macOS 10.12",
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
			},
			safari: {
				"browserName": "safari",
				"version": "latest",
				"platform": "macOS 10.12",
				"safariIgnoreFraudWarning": true,
				"safariAllowPopups": false
			},
			iphoneSimulator: {
				"appiumVersion": "1.6.3",
				"deviceName": "iPhone Simulator",
				"deviceOrientation": "portrait",
				"platformVersion": "10.0",
				"platformName": "iOS",
				"browserName": "Safari"
			},
			androidSimulator: {
				"appiumVersion": "1.5.3",
				"deviceName": "Android Emulator",
				"deviceOrientation": "portrait",
				"platformVersion": "5.1",
				"platformName": "Android",
				"browserName": "Browser"
			},
			iphone: {
				"appiumVersion": "1.5.3",
				"deviceName": "iPhone 6s Device",
				"deviceOrientation": "portrait",
				"platformVersion": "9.3",
				"platformName": "iOS",
				"browserName": "Safari",
			},
			android: {
				"appiumVersion": "1.5.3",
				"deviceName": "Samsung Galaxy S7 Device",
				"deviceOrientation": "portrait",
				"platformVersion": "6.0",
				"platformName": "Android",
				"browserName": "chrome"
			}
		}
	}
};

module.exports = capsSauceLabs;