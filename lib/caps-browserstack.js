"use strict";

const capsBrowserStack = function () {
	return {
		common: {
			'name': "Get Screenshots",
			'build' : "version1.0.0",
			'project' : "Test Project",
			'acceptSslCerts' : 'true',
			"resolution" : this.cap.resolution || "1024x768",

			'browserstack.debug' : 'true',
			'browserstack.video' : 'true',
			'browserstack.timezone': this.cap['browserstack.timezone'] || this.cap.timezone
		},

		browsers: {

			windows: {

				chrome: {
					"browserName": "chrome",
					'browser_version' : '55.0',
					'os' : 'Windows',
					'os_version' : '10'
				},
				firefox: {
					"browserName": "firefox",
					'browser_version' : '51.0 beta',
					'os' : 'Windows',
					'os_version' : '10'
				},
				ie11: {
					"browserName": "IE",
					"os" : "Windows",
					"os_version" : "10",
					"browser_version" : "11.0"
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
					'os_version' : 'Sierra'
				},
				firefox: {
					"browserName": "firefox",
					'browser_version' : '51.0 beta',
					'os' : 'OS X',
					'os_version' : 'Sierra'
				},
				safari: {
					"browserName": "safari",
					"browser_version" : "10.0",
					"os" : "OS X",
					"os_version" : "Sierra"
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