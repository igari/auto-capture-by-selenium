"use strict";

const assert = require("assert");

const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;

const SauceLabs = require("saucelabs");

const argv = require('argv');
argv.option({
	name: 'width',
	short: 'w',
	type: 'string',
	description: 'viewportサイズの幅',
	example: `npm run ss -- --width=1024`
});
argv.option({
	name: 'height',
	short: 'h',
	type: 'string',
	description: 'viewportサイズの高さ',
	example: `npm run ss -- --height=720`
});
argv.option({
	name: 'reporter',
	short: 'r',
	type: 'string',
	description: 'mocha + mochawesome用のパラメータ',
	example: `npm run ss -- --reporter mochawesome`
});
argv.option({
	name: 'reporter-options',
	short: 'o',
	type: 'string',
	description: 'mocha + mochawesomeのオプション用のパラメータ',
	example: `npm run ss -- --reporter-options reportDir=customReportDir,reportFilename=customReportFilename`
});
argv.option({
	name: 'source',
	short: 's',
	type: 'path',
	description: '対象のURLリストを指定します。',
	example: `'npm run ss -- --source=./capture-list.json'`
});
argv.option({
	name: 'browser',
	short: 'b',
	type: 'string',
	description: '起動するブラウザを選択します。選択肢は[chrome, firefox, ie]のいずれかです。',
	example: `'npm run ss -- --browser=chrome'`
});
argv.option({
	name: 'sauceLabsId',
	short: 'u',
	type: 'string',
	description: 'SauceLabsを利用する場合にID（ユーザー名）を指定します。',
	example: `'npm run ss -- --sauceLabsId=xxxxxx --sauceLabsPass=xxxxxx'`
});
argv.option({
	name: 'sauceLabsPass',
	short: 'k',
	type: 'string',
	description: 'SauceLabsを利用する場合にパスワードを指定します。',
	example: `'npm run ss -- --sauceLabsId=xxxxxx --sauceLabsPass=xxxxxx'`
});
argv.option({
	name: 'basicAuthId',
	short: 'i',
	type: 'string',
	description: 'Basic認証が必要な場合にID（ユーザー名）を指定します。',
	example: `'npm run ss -- --basicAuthId=xxxxxx --basicAuthPass=xxxxxx'`
});
argv.option({
	name: 'basicAuthPass',
	short: 'p',
	type: 'string',
	description: 'Basic認証が必要な場合にパスワードを指定します。',
	example: `'npm run ss -- --basicAuthId=xxxxxx --basicAuthPass=xxxxxx'`
});

const options = argv.run().options;

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

		this.sauceLabsId = options.sauceLabsId;
		this.sauceLabsPass = options.sauceLabsPass;

		this.sauceLabsServer = "http://" + this.sauceLabsId + ":" + this.sauceLabsPass + "@ondemand.saucelabs.com:80/wd/hub";

		this.saucelabs = new SauceLabs({
			username: this.sauceLabsId,
			password: this.sauceLabsPass
		});

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

			'excludeSwitches': [
				'disable-component-update'
			]
		};

		this.testName = "Get Screenshots";
	},
	setBrowserCaps: function () {

		this.commonCap = {
			"name": this.testName,
			'username': this.sauceLabsId,
			'accessKey': this.sauceLabsPass,
			// 'seleniumVersion': '3.0.0',
			'unexpectedAlertBehaviour': 'ignore',
			'locationContextEnabled': false,
		};

		this.browserCaps = {
			chromeMac: {
				'browserName': 'chrome',
				'version': 'latest',
				'platform': 'OS X 10.9',
				'chromeOptions': this.chromeOptions
			},
			chromeWin: {
				'browserName': 'chrome',
				'version': 'latest',
				'platform': 'Windows 10',
				'chromeOptions': this.chromeOptions
			},
			firefoxWin: {
				'browserName': 'firefox',
				'version': 'latest',
				'platform': 'Windows 10'
			},
			firefoxMac: {
				'browserName': 'firefox',
				'version': 'latest',
				'platform': 'macOS 10.12'
			},
			ie11: {
				'browserName': 'internet explorer',
				'version': 'latest',
				'platform': 'Windows 10'
			},
			edge: {
				'browserName': 'MicrosoftEdge',
				'version': '14.14393',
				'platform': 'Windows 10'
			},
			safari: {
				'browserName': 'safari',
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
				"browserName": "Safari"
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
			throw new Error('Your specified browser could not found. Please specify from the following list.\n\n' + Object.keys(this.browserCaps).join('\n'));
		}
		this.currentCaps = this.browserCaps[this.currentBrowser] || this.browserCaps['firefoxWin'];
		this.currentBrowserName = this.currentCaps.browserName;

		if(this.sauceLabsId && this.sauceLabsPass) {
			this.driver = new webdriver.Builder()
				.withCapabilities(this.currentCaps)
				.usingServer(this.sauceLabsServer)
				.build();

		} else {

			this.driver = new webdriver.Builder()
				.forBrowser(this.currentCaps.browserName)
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
		if(this.sauceLabsId && this.sauceLabsPass) {
			this.saucelabs.updateJob(this.driver.sessionID, {
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