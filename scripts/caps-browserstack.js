"use strict";

const capsBrowserStack = function (options) {
	return {
		common: {
			'name': this.testName,
			'build' : 'version1.0.0',
			'project' : 'PROJECT NAME',
			'acceptSslCerts' : 'true',
			"resolution" : options.resolution || "1024x768",
			'browserstack.user': options.browserStackId,
			'browserstack.key' : options.browserStackPass,
			'browserstack.local' : options.browserStackLocal || 'false',
			'browserstack.debug' : 'true',
			'browserstack.video' : 'true',
			'browserstack.timezone': 'Asia/Tokyo',
			'browserstack.selenium_version': ''
		},

		browsers: {

			chromeMac: {
				"browserName": "chrome",
				'browser_version' : '55.0',
				'os' : 'OS X',
				'os_version' : 'Sierra',
				"chromeOptions": this.chromeOptions,
			},
			chromeWin: {
				"browserName": "chrome",
				'browser_version' : '55.0',
				'os' : 'Windows',
				'os_version' : '10',
				"chromeOptions": this.chromeOptions,
			},
			firefoxWin: {
				"browserName": "firefox",
				'browser_version' : '51.0 beta',
				'os' : 'Windows',
				'os_version' : '10',
				'firefox_profile': null,
			},
			firefoxMac: {
				"browserName": "firefox",
				'browser_version' : '51.0 beta',
				'os' : 'OS X',
				'os_version' : 'Sierra',
				'firefox_profile': null,
			},
			ie11: {
				"browserName": "IE",
				"os" : "Windows",
				"os_version" : "10",
				"browser_version" : "11.0",
				'browserstack.ie.enablePopups' : 'false',
			},
			edge: {
				"browserName": "Edge",
				"os" : "Windows",
				"os_version" : "10",
				"browser_version" : "14.0",
			},
			safari: {
				"browserName": "safari",
				"browser_version" : "10.0",
				"os" : "OS X",
				"os_version" : "Sierra",
				"safariIgnoreFraudWarning": true,
				"safariAllowPopups": false,
				'browserstack.safari.enablePopups' : 'false',
			},
			iphone: {
				'browserName' : 'iPhone',
				'platform' : 'MAC',
				'device' : 'iPhone 6S',
				'deviceOrientation': 'portrait'
			},
			android: {
				'browserName' : 'android',
				'platform' : 'ANDROID',
				'device' : 'Google Nexus 5',
				'deviceOrientation': 'portrait'
			}
		}
	}
};

module.exports = capsBrowserStack;