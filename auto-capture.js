"use strict";

const argv = require('argv');
const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;
const SauceLabs = require("saucelabs");
const Capture = require('./scripts/capture');

const DEVICE = {
	PC: 'pc',
	SP: 'sp'
};

const PATH = {
	DEST_DIR: './output/'
};

var WebDriver = {
	init: function() {
		this.start();
		this.setOptions();
		this.setParameters();
		this.setBrowserCaps();
		this.buildBrowser();
		return this.initialConfig()
			.then(this.capturePages.bind(this))
			.then(this.end.bind(this));
	},
	setOptions: function() {

		argv.option({
			name: 'source',
			short: 's',
			type: 'path',
			description: '対象のURLリストを指定します。',
			example: `'node auto-capture.js --source=./capture-list.json'`
		});
		argv.option({
			name: 'browser',
			short: 'b',
			type: 'string',
			description: '起動するブラウザを選択します。選択肢は[chrome, firefox, ie]のいずれかです。',
			example: `'node auto-capture.js --browser=chrome'`
		});
		argv.option({
			name: 'sauceLabsId',
			short: '',
			type: 'string',
			description: 'SauceLabsを利用する場合にID（ユーザー名）を指定します。',
			example: `'node auto-capture.js --sauceLabsId=xxxxxx --sauceLabsPass=xxxxxx'`
		});
		argv.option({
			name: 'sauceLabsPass',
			short: '',
			type: 'string',
			description: 'SauceLabsを利用する場合にパスワードを指定します。',
			example: `'node auto-capture.js --sauceLabsId=xxxxxx --sauceLabsPass=xxxxxx'`
		});
		argv.option({
			name: 'basicId',
			short: 'i',
			type: 'string',
			description: 'Basic認証が必要な場合にID（ユーザー名）を指定します。',
			example: `'node auto-capture.js --basicId=xxxxxx --basicPass=xxxxxx'`
		});
		argv.option({
			name: 'basicPass',
			short: 'p',
			type: 'string',
			description: 'Basic認証が必要な場合にパスワードを指定します。',
			example: `'node auto-capture.js --basicId=xxxxxx --basicPass=xxxxxx'`
		});

		this.argv = argv.run();
	},
	setParameters: function() {

		this.basicAuth = {
			id: this.argv.options.basicId,
			pass: this.argv.options.basicPass
		};

		this.sauceLabsId = this.argv.options.sauceLabsId;
		this.sauceLabsPass = this.argv.options.sauceLabsPass;

		this.sauceLabsServer = "http://" + this.sauceLabsId + ":" + this.sauceLabsPass + "@ondemand.saucelabs.com:80/wd/hub";

		this.saucelabs = new SauceLabs({
			username: this.sauceLabsId,
			password: this.sauceLabsPass
		});

		this.captureList = this.getCaptureList(DEVICE.PC);

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

			// 'excludeSwitches': [
			// 	'disable-component-update'
			// ]
		};

		this.testName = "Get Screenshots";
	},
	setBrowserCaps: function () {

		this.caps = {
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
				// "safariIgnoreFraudWarning": true,
				// "safariAllowPopups": false
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
			}
		};

		for(let browser in this.caps) {
			if(this.caps.hasOwnProperty(browser)) {
				let cap = this.caps[browser];
				Object.assign(cap, {
					"name": this.testName,
					'username': this.sauceLabsId,
					'accessKey': this.sauceLabsPass,
					// 'seleniumVersion': '3.0.0',
					// 'unexpectedAlertBehaviour': 'ignore',
					// 'locationContextEnabled': false,
				})
			}
		}
	},
	buildBrowser: function () {

		this.currentBrowser = this.argv.options.browser || 'firefoxWin';
		if(!this.caps[this.currentBrowser]) {
			throw new Error('Your specified browser could not found.');
		}
		this.currentCaps = this.caps[this.currentBrowser] || this.caps['firefoxWin'];
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

		// return this.driver.getSession().then(function (sessionid){
		// 	this.driver.sessionID = sessionid.id_;
		// }.bind(this));

	},

	initialConfig: function() {
		this.driver.manage().timeouts().implicitlyWait(30*1000);
		this.driver.manage().timeouts().setScriptTimeout(60*60*1000);
		return Promise.resolve();
	},

	capturePages: function() {
		var _this = this;
		var _resolve;
		var _reject;

		var _capturePages = function(index) {
			var isLast = index === _this.captureList.length - 1;
			_this.executeCapture(_this.captureList[index])
				.then(function() {
					if (isLast) {
						_resolve();
					} else {
						_capturePages(++index);
					}
				});
		};

		return new Promise(function( resolve, reject ) {
			_resolve = resolve;
			_reject = reject;
			_capturePages(0);
		});
	},
	executeCapture: function(url) {
		console.log(url);
		var capture = new Capture(this.driver);
		var captureUrl = this.getDestPath(this.getImageFileName(url));

		return new Promise(function(resolve, reject) {

			if (this.basicAuth.id && this.basicAuth.pass) {
				//Override
				url = this.getUrlForBasicAuth(url, this.basicAuth.id, this.basicAuth.pass)
			}

			return this.driver.get(url)
				.then(function () {
					if(this.basicAuth.id && this.basicAuth.pass && /safari/.test(this.currentBrowserName)) {
						return this.driver.wait(until.elementLocated(By.id('ignoreWarning')))
							.then(function (button) {
								return button.click();
							}.bind(this))
							.then(function () {
								return this.driver.sleep(1000);
							}.bind(this))
					}
				}.bind(this))
				.then(function() {
					var timeout = 60*60*1000;
					return this.driver.wait(this.executeScript(this.unbindBeforeLoad.bind(this)), timeout);
				}.bind(this))
				.then(function() {
					return this.driver.executeScript("try{$(window).off('beforeunload');window.onbeforeunload=null;}catch(e){}");
				}.bind(this))
				.then(function () {
					if(/chrome/.test(this.currentBrowserName)) {
						return capture.saveFullScreenShot(captureUrl);
					} else {
						return capture.saveScreenShot(captureUrl);
					}
				}.bind(this))
				.then(function() {
					resolve();
				}.bind(this))
				.catch(function (e) {
					throw new Error(e);
				});
		}.bind(this));
	},
	executeScript: function (func) {
		return this.driver.executeScript(this.func2str(func));
	},
	unbindBeforeLoad: function() {
		var domready = document.readyState === 'complete';
		if(domready) {
			var jQueryScript = document.querySelector('script[src*="jquery"]');
			if(jQueryScript.length > 0) {
				var __jquery__ = jQuery && $;
				if(__jquery__) {
					try{
						var beforeunload = __jquery__._data(__jquery__(window)[0], 'events').beforeunload;
						return beforeunload instanceof Array && beforeunload.length > 0;
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
	getCaptureList: function(deviceType) {
		console.log(this.argv.options.source);
		var CaptureJson = require(this.argv.options.source || './capture-list.json');
		var captureTarget = CaptureJson.captureTarget;
		var captureList;

		switch (deviceType) {
			case DEVICE.PC:
				captureList = captureTarget[0].pc;
				break;
			case DEVICE.SP:
				captureList = captureTarget[0].sp;
				break;
			default:
				break;
		}
		return captureList;
	},
	getUrlForBasicAuth: function(url, id, pass) {
		let separator = '://';
		let splitURL = url.split(separator);
		let protocol = splitURL[0] + separator;
		let urlBody = splitURL[1];
		url = `${protocol}${id}:${pass}@${urlBody}`;
		console.log(url);
		return url;
	},
	getImageFileName: function(url) {
		return url.split('://')[1].replace(/\//g, '_') + '.png';
	},
	getDestPath: function(fileName) {
		return `${PATH.DEST_DIR}${this.currentBrowser}/${fileName}`;
	},
	start: function() {
		console.time('Processing Time');
	},
	end: function() {
		this.driver.quit();
		this.saucelabs.updateJob(this.driver.sessionID, {
			name: this.testName,
			passed: true
		});
		console.log('---- COMPLETE ----');
		console.timeEnd('Processing Time');
	}
};

WebDriver.init();
