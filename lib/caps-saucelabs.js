"use strict";

const capsSauceLabs = function () {

	return {

		common: {
			"name": "Get Screenshot",
			'username': '',//Add username for Sauce Labs
			'accessKey': '',//Add accessKey for Sauce Labs
			"screenResolution" : this.cap.resolution || "1024x768",
			"timeZone": "Tokyo",
			"videoUploadOnPass": false,
			"recordVideo": true,
			"recordScreenshots": true,
			"recordLogs": true,
			"captureHtml": true,
			"webdriverRemoteQuietExceptions": false
		},

		browsers: {

			windows: {

				chrome: {
					"browserName": "chrome",
					"version": "latest",
					"platform": "Windows 10",
					"chromeOptions": this.cap.chromeOptions,
				},
				firefox: {
					"browserName": "firefox",
					"version": "latest",
					"platform": "Windows 10",
					'firefox_profile': this.firefoxProfile,
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
			},
			mac: {

				chrome: {
					"browserName": "chrome",
					"version": "latest",
					"platform": "OS X 10.9",
					"chromeOptions": this.cap.chromeOptions,
				},
				firefox: {
					"browserName": "firefox",
					"version": "latest",
					"platform": "macOS 10.12",
					'firefox_profile': this.firefoxProfile,
				},
				safari: {
					"browserName": "safari",
					"version": "latest",
					"platform": "macOS 10.12",
					"safariIgnoreFraudWarning": true,
					"safariAllowPopups": false
				}
			},
			android: {

				chrome: {
					"appiumVersion": "1.5.3",
					"deviceName": "Samsung Galaxy S7 Device",
					"deviceOrientation": "portrait",
					"platformVersion": "6.0",
					"platformName": "Android",
					"browserName": "chrome"
				}
			},
			android_emulator: {

				chrome: {
					"appiumVersion": "1.5.3",
					"deviceName": "Android Emulator",
					"deviceOrientation": "portrait",
					"platformVersion": "5.1",
					"platformName": "Android",
					"browserName": "Browser"
				}
			},
			ios: {

				safari: {
					"appiumVersion": "1.5.3",
					"deviceName": "iPhone 6s Device",
					"deviceOrientation": "portrait",
					"platformVersion": "9.3",
					"platformName": "iOS",
					"browserName": "Safari",
				}
			},
			ios_emulator: {

				safari: {
					"appiumVersion": "1.6.3",
					"deviceName": "iPhone Simulator",
					"deviceOrientation": "portrait",
					"platformVersion": "10.0",
					"platformName": "iOS",
					"browserName": "Safari"
				}
			}
		}
	}
};

module.exports = capsSauceLabs;