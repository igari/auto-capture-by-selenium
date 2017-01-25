"use strict";

const options = require('./scripts/options.js');

const assert = require("assert");

const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;

const SauceLabs = require("saucelabs");

const Capture = require('./scripts/capture');
const urlListPath = options.source || './capture-list.json';
const captureList = require(urlListPath);

const PATH = {
	DEST_DIR: './output/'
};

const WebDriver = {
	init: function() {
		this.start();
		this.setParameters();
		this.setBrowserCaps();
		this.buildBrowser();
		this.initialConfig();
	},
	setParameters: function() {

		this.basicAuth = {
			id: options.basicAuthId,
			pass: options.basicAuthPass
		};

		this.sauceLabs = new SauceLabs({
			username: options.sauceLabsId,
			password: options.sauceLabsPass
		});
		this.sauceLabsServer = "http://" + options.sauceLabsId + ":" + options.sauceLabsPass + "@ondemand.saucelabs.com:80/wd/hub";
		this.browserStackServer = 'http://hub-cloud.browserstack.com/wd/hub';

		this.chromeOptions = {

			//Android Mobile
			//args: ['user-agent=Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2725.0 Mobile Safari/537.36'],

			//Android Tablet
			//args: ['user-agent=Mozilla/5.0 (Linux; Android 4.3; Nexus 7 Build/JSS15Q) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2725.0 Safari/537.36'],

			//iPhone
			//args: ['user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B137 Safari/601.1'],

			//iPad
			//args: ['user-agent=Mozilla/5.0 (iPad; CPU OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B137 Safari/601.1'],

			//args: ["incognito"],

			"excludeSwitches": [
				"disable-component-update",
				"disable-popup-blocking"
			]
		};

		this.testName = "Get Screenshots";

	},
	setBrowserCaps: function () {

		this.commonCap = {
			"unexpectedAlertBehaviour": "ignore",
			"locationContextEnabled": false,
			// "seleniumVersion": "3.0.0",
		};

		if(options.browserStackId && options.browserStackPass) {

			Object.assign(this.commonCap, {
				'build' : 'version1',
				'project' : 'newintropage',
				'acceptSslCerts' : 'true',
				"resolution" : options.resolution || "1024x768",
				'browserstack.user': options.browserStackId,
				'browserstack.key' : options.browserStackPass,
				'browserstack.local' : options.browserStackLocal || 'false',
				'browserstack.ie.enablePopups' : 'false',
				'browserstack.safari.enablePopups' : 'false',
				'browserstack.debug' : 'true',
				'browserstack.video' : 'true',
			});

			this.browserCaps = {

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
					"safariAllowPopups": false
				},
				iphone: {
					'browserName' : 'iPhone',
					'platform' : 'MAC',
					'device' : 'iPhone 6S',
				},
				android: {
					'browserName' : 'android',
					'platform' : 'ANDROID',
					'device' : 'Google Nexus 5',
				}
			};

		}

		if(options.sauceLabsId && options.sauceLabsPass) {

			Object.assign(this.commonCap, {
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
			});

			this.browserCaps = {

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
			};

		}


		for(let browser in this.browserCaps) {
			if(this.browserCaps.hasOwnProperty(browser)) {
				let cap = this.browserCaps[browser];
				Object.assign(cap, this.commonCap);
			}
		}
	},
	buildBrowser: function () {

		this.currentBrowser = options.browser || 'firefoxWin';

		if(!this.browserCaps[this.currentBrowser]) {
			assert(false, 'Your specified browser could not found. Please specify from the following list.\n\n' + Object.keys(this.browserCaps).join('\n'));
		}

		this.currentCaps = this.browserCaps[this.currentBrowser] || this.browserCaps['firefoxWin'];
		this.currentBrowserName = this.currentCaps.browserName;

		if(options.sauceLabsId && options.sauceLabsPass) {
			this.currentServer = this.sauceLabsServer;
		} else if(options.browserStackId && options.browserStackPass) {
			this.currentServer = this.browserStackServer;
		}

		if(this.currentServer) {
			console.log(this.currentCaps)
			console.log(this.currentServer)
			this.driver = new webdriver.Builder()
				.withCapabilities(this.currentCaps)
				.usingServer(this.currentServer)
				.build();
		} else {
			this.driver = new webdriver.Builder()
				.forBrowser(options.browser)
				.build();
		}
	},

	initialConfig: function() {
		this.driver.manage().timeouts().implicitlyWait(30*1000);
		this.driver.manage().timeouts().setScriptTimeout(24*60*60*1000);
		this.driver.manage().timeouts().setScriptTimeout(24*60*60*1000);
		if(options.width && options.height) {
			this.driver.manage().window().setSize(+options.width, +options.height);
		}
		this.driver.getSession().then(function (sessionid){
			this.driver.sessionID = sessionid.id_;
		}.bind(this));
	},
	executeCapture: function(url) {
		var capture = new Capture(this.driver);
		var captureUrl = this.getDestPath(this.getImageFileName(url));
		var that = this;

		return new Promise(function (resolve, reject) {

			if (this.basicAuth.id && this.basicAuth.pass) {
				//Override
				url = this.getUrlForBasicAuth(url, this.basicAuth.id, this.basicAuth.pass)
			}

			return this.driver.get(url)
				.then(function () {
					if (this.basicAuth.id && this.basicAuth.pass && /safari/.test(this.currentBrowserName)) {
						return this.driver.wait(until.elementLocated(By.id('ignoreWarning')), 10*1000, 'The button could not found.')
							.then(function (button) {
								return button.click();
							}.bind(this))
							.then(function () {
								return this.driver.sleep(1000);
							}.bind(this));
					}
				}.bind(this))
				.then(function () {
					var timeout = 30/*s*/ * 1000/*ms*/;
					return this.driver.wait(this.executeScript(this.waitForUnbindingBeforeLoad.bind(this)), timeout, 'unbinding could not be completed.');
				}.bind(this))
				.then(function () {
					return this.executeScript(this.unbindBeforeUnload.bind(this));
				}.bind(this))
				.then(function () {
					if (/chrome/.test(this.currentBrowserName)) {
						return capture.saveFullScreenShot(captureUrl);
					} else {
						return capture.saveScreenShot(captureUrl);
					}
				}.bind(this))
				.then(function () {
					resolve();
				}.bind(this))
				.catch(function (error) {
					assert(false, error);
					reject(error);
					// throw new Error(e);
				});
		}.bind(this));
	},
	executeScript: function (func) {
		return this.driver.executeScript(this.func2str(func));
	},
	avoidGeoLocationPermissionDialog: function () {
		return this.driver.wait(until.alertIsPresent(), 10*1000, 'Dialog could not found.')
			.then(function (alert) {
				console.log(alert);
				return alert.dismiss();
			})
	},
	unbindBeforeUnload: function() {
		window.onbeforeunload=null;
		try{
			$(window).off('beforeunload');
		} catch(e) {}
	},
	waitForUnbindingBeforeLoad: function() {
		var iaPageLoaded = document.readyState === 'complete' &&
			performance.timing.loadEventEnd &&
			performance.timing.loadEventEnd > 0;

		if(iaPageLoaded) {
			var jQueryScript = document.querySelector('script[src*="jquery"]');
			if(jQueryScript.length > 0) {
				var __jquery__ = jQuery || $;
				if(__jquery__) {
					try{
						var beforeunload = __jquery__._data(__jquery__(window)[0], 'events').beforeunload;
						return beforeunload && beforeunload instanceof Array && beforeunload.length > 0;
					} catch(e) {
						return false;
					}
				} else {
					return false;
				}
			} else {
				return true;
			}
		} else {
			return false;
		}

	},
	func2str: function (func) {
		let funcString = '\"' + func.toString().replace(/^function \(\) \{/, '').replace(/}$/, '').trim() + '\"';
		return funcString;
	},
	getUrlForBasicAuth: function(url, id, pass) {
		let separator = '://';
		let splitURL = url.split(separator);
		let protocol = splitURL[0] + separator;
		let urlBody = splitURL[1];
		url = `${protocol}${id}:${pass}@${urlBody}`;
		return url;
	},
	getImageFileName: function(url) {
		return url.split('://')[1].replace(/\//g, '_') + '.png';
	},
	getDestPath: function(fileName) {
		return `${PATH.DEST_DIR}${this.currentBrowser}/${fileName}`;
	},
	start: function() {
		// console.time('\tProcessing Time');
		return Promise.resolve();
	},
	end: function() {
		this.driver.quit();
		if(options.sauceLabsId && options.sauceLabsPass) {
			this.sauceLabs.updateJob(this.driver.sessionID, {
				name: this.testName,
				passed: true
			});
		}
		// console.log('\t---- COMPLETE ----');
		// console.timeEnd('\tProcessing Time');
	}
};

if(process.argv[1].match(/mocha$/)) {
	describe('get screenshots', function () {
		this.timeout(1/*m*/*60/*s*/*1000/*ms*/);

		before(function () {
			WebDriver.init();
		});

		captureList.forEach(function (url) {
			it(url, function () {
				return WebDriver.executeCapture(url);
			});
		});

		after(function () {
			WebDriver.end();
		});

	});
} else {
	let promises = [];
	WebDriver.init();
	captureList.forEach(function (url) {
		let promise = WebDriver.executeCapture(url).then(function () {
			console.log(url);
		});
		promises.push(promise);
	});
	Promise.all(promises).then(function () {
		WebDriver.end();
	});
}