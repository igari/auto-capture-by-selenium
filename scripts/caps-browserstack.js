"use strict";

const capsBrowserStack = function (options) {
	return {
		common: {
			'name': this.testName,
			'build' : this.buildVersion,
			'project' : this.projectName,
			'acceptSslCerts' : 'true',
			"resolution" : options.resolution || "1024x768",
			'browserstack.user': options.browserStackId,
			'browserstack.key' : options.browserStackPass,
			'browserstack.local' : options.browserStackLocal || 'false',
			'browserstack.debug' : 'true',
			'browserstack.video' : 'true',
			'browserstack.timezone': 'Asia/Tokyo',
			// 'browserstack.selenium_version': ''
		},

		browsers: {

			windows: {

				chrome: {
					"browserName": "chrome",
					'browser_version' : '55.0',
					'os' : 'Windows',
					'os_version' : '10',
					"chromeOptions": this.chromeOptions,
				},
				firefox: {
					"browserName": "firefox",
					'browser_version' : '51.0 beta',
					'os' : 'Windows',
					'os_version' : '10',
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
				}
			},
			mac: {

				chrome: {
					"browserName": "chrome",
					'browser_version' : '55.0',
					'os' : 'OS X',
					'os_version' : 'Sierra',
					"chromeOptions": this.chromeOptions,
				},
				firefox: {
					"browserName": "firefox",
					'browser_version' : '51.0 beta',
					'os' : 'OS X',
					'os_version' : 'Sierra',
					'firefox_profile': null,
				},
				safari: {
					"browserName": "safari",
					"browser_version" : "10.0",
					"os" : "OS X",
					"os_version" : "Sierra",
					"safariIgnoreFraudWarning": true,
					"safariAllowPopups": false,
					'browserstack.safari.enablePopups' : 'false',
				}
			},
			android: {

				chrome: {
					'browserName' : 'android',
					'platform' : 'ANDROID',
					'device' : 'Samsung Galaxy S5',
					'deviceOrientation': 'portrait'
				}
			},
			ios: {

				safari: {
					'browserName' : 'safari',
					'platform' : 'MAC',
					'device' : 'iPhone 6S',
					'deviceOrientation': 'portrait'
				},
				chrome: {
					'browserName' : 'chrome',
					'platform' : 'MAC',
					'device' : 'iPhone 6S',
					'deviceOrientation': 'portrait'
				}
			},
		}
	}
};

module.exports = capsBrowserStack;