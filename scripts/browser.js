"use strict";

const assert = require("assert");
const webdriver = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const By = webdriver.By;
const until = webdriver.until;
const Capture = require("./capture.js");
const SauceLabs = require("saucelabs");
const path = require("path");
const fs = require("fs");

function Browser(pages, cap, options) {

	this.pages = pages;
	this.cap = cap;
	this.options = options;

	this.setPathOfChromeDriver(options);
}


Browser.prototype = {

	setPathOfChromeDriver: function (options) {

		if(this.cap.browserName !== 'chrome') {
			return;
		}

		let pathOfSeleniumStandalone = path.join(__dirname, '../../../', `/node_modules/selenium-standalone/`);
		if(!fs.statSync(pathOfSeleniumStandalone).isDirectory()) {
			//Override
			pathOfSeleniumStandalone = path.join(__dirname, '../', `/node_modules/selenium-standalone/`)
		}

		let chromeDriverPath = pathOfSeleniumStandalone + `.selenium/chromedriver/${options.drivers.chrome.version}-${options.drivers.chrome.arch}-chromedriver`;
		chrome.setDefaultService(new chrome.ServiceBuilder(chromeDriverPath).build());
	},
	
	run: function () {

		//Before
		return this.init()
			.then(function () {

				console.log(
					'\n' +
					'========================================\n' +
					this.testLabel + '\n' +
					'========================================'
				);

				let promises = [];

				//Main
				this.pages.forEach(function (page) {
					console.time('\n\n end: ' + page.url);
					let promise = this.executeCapture(page)
						.then(function () {
							console.timeEnd('\n\n end: ' + page.url);
						});
					promises.push(promise);
				}.bind(this));

				return Promise.all(promises);
			}.bind(this))
			//After
			.then(this.end.bind(this));
	},

	init: function() {
		this.setBrowserCaps();

		this.testLabel = ' get screenshots / ' + this.cap.browserName + ' on ' + this.cap.os + ' with ' + this.platform;
		console.log('\n\n');
		console.time(this.testLabel);

		return this.buildBrowser()
			.then(this.initialConfig.bind(this));
	},

	setBrowserCaps: function () {

		this.commonCap = {
			"unexpectedAlertBehaviour": "ignore",
			"locationContextEnabled": false,
			"webStorageEnabled": true
		};

		this.isSauceLabs = this.cap.username && this.cap.accessKey;
		this.isBrowserStack = this.cap['browserstack.user'] && this.cap['browserstack.key'];
		this.isLocal = !this.isBrowserStack && !this.isSauceLabs;

		if(this.isSauceLabs) {
			this.platform = 'saucelabs'
		}
		if(this.isBrowserStack) {
			this.platform = 'browserstack'
		}
		if(this.isLocal) {
			this.platform = 'local'
		}

		this.isMobile = /android|android_emulator|ios|ios_emulator/.test(this.cap.os);

		switch(this.platform) {
			case 'browserstack':
				let capsBrowserStack = require('./caps-browserstack.js').bind(this);
				let capsBrowserStackCommon = capsBrowserStack().common;
				let capsBrowserStackBrowser = capsBrowserStack().browsers[this.cap.os][this.cap.browserName];
				let browserStackServer = 'http://hub-cloud.browserstack.com/wd/hub';
				this.browserCap = Object.assign({}, this.commonCap, capsBrowserStackCommon, this.cap, capsBrowserStackBrowser);
				this.remoteTesingServer = browserStackServer;
				break;
			case 'saucelabs':
				let capsSauceLabs = require('./caps-saucelabs.js').bind(this);
				let capsSauceLabsCommon = capsSauceLabs().common;
				let capsSauceLabsBrowser = capsSauceLabs().browsers[this.cap.os][this.cap.browserName];
				let sauceLabsServer = "http://" + this.cap.username + ":" + this.cap.accessKey + "@ondemand.saucelabs.com:80/wd/hub";
				this.browserCap = Object.assign({}, this.commonCap, capsSauceLabsCommon, this.cap, capsSauceLabsBrowser);
				this.remoteTesingServer = sauceLabsServer;
				break;
			default:
				this.cap.os = this.cap.os || /^win/.test(process.platform) ? 'windows' : 'mac';
				const capsLocal = require('./caps-local.js').bind(this);
				const capsLocalBrowser = capsLocal().browsers[this.cap.os][this.cap.browserName];
				this.browserCap = Object.assign({}, this.commonCap, this.cap, capsLocalBrowser);
				break;
		}
	},
	buildBrowser: function () {

		if(this.remoteTesingServer) {
			this.driver = new webdriver.Builder()
				.withCapabilities(this.browserCap)
				.usingServer(this.remoteTesingServer)
				.build();
		} else {
			this.driver = new webdriver.Builder()
				.withCapabilities(this.browserCap)
				.build();
		}
		return typeof this.driver.then === 'function' ? this.driver : Promise.resolve();
	},

	initialConfig: function() {

		let timeouts = this.driver.manage().timeouts();
		return Promise.resolve()
			.then(timeouts.implicitlyWait.bind(timeouts, 60/*m*/*60/*s*/*1000/*ms*/))
			.then(timeouts.setScriptTimeout.bind(timeouts, 60/*m*/*60/*s*/*1000/*ms*/))
			.then(timeouts.pageLoadTimeout.bind(timeouts, 60/*m*/*60/*s*/*1000/*ms*/))
			.then(function () {
				if(!this.isMobile) {
					return this.driver.manage().window().setSize(+this.browserCap.width || 1200, +this.browserCap.height || 800);
				}
			}.bind(this))
			.then(function () {
				return this.driver.getSession().then(function (sessionid){
					this.driver.sessionID = sessionid.id_;
				}.bind(this));
			}.bind(this));

	},
	executeCapture: function(page) {

		var capture = new Capture(this);
		var captureUrl = this.getDestPath(this.getImageFileName(page.url));

		return this.driver.get(page.url)
			.then(function () {

				let testLabel = ' start: ' + page.url;
				console.log('\n\n-----------------------------------');
				console.log(testLabel)
				console.log('- - - - - - - - - - - - - - - - - -\n');

				let hasBasicAuthInURL = page.url.match(/https?:\/\/.+:.+@.+/);
				if (hasBasicAuthInURL && !this.isBrowserStack && /safari/.test(this.cap.browserName)) {
					return this.driver.wait(until.elementLocated(By.id('ignoreWarning')), 10/*s*/*1000/*ms*/, 'The button could not found.')
						.then(function (button) {
							return button.click();
						}.bind(this))
						.then(this.driver.sleep.bind(this.driver, 1/*s*/*1000/*ms*/));
				}
			}.bind(this))
			.then(function () {
				var timeout = 60/*s*/ * 1000/*ms*/;
				return this.driver.wait(this.executeScript(this.waitForUnbindingBeforeLoad), timeout, 'unbinding could not be completed.');
			}.bind(this))
			.then(function () {
				return this.executeScript(this.unbindBeforeUnload);
			}.bind(this))
			.then(function () {
				if(typeof page.executeScript === 'function') {
					return this.executeScript(page.executeScript)
						.then(console.log);
				}
			}.bind(this))
			.then(function () {
				if(typeof page.executeAsyncScript === 'function') {
					return this.executeAsyncScript(page.executeAsyncScript)
						.then(console.log);
				}
			}.bind(this))
			.then(function () {
				if(this.isMobile) {
					if (/chrome|safari/.test(this.cap.browserName)) {
						return capture.saveFullScreenShot(captureUrl);
					} else {
						return capture.saveScreenShot(captureUrl);
					}
				} else {
					if (/chrome|firefox/.test(this.cap.browserName)) {
						return capture.saveFullScreenShot(captureUrl);
					} else {
						return capture.saveScreenShot(captureUrl);
					}
				}
			}.bind(this))
			.catch(function (error) {
				assert(false, error);
			});
	},
	overrideUrlIfHasBasicAuth: function (page, hasBasicAuth) {
		if(hasBasicAuth) {
			page.url = this.getUrlForBasicAuth(page.url, page.basicAuth.user, page.basicAuth.key)
		}
		return Promise.resolve(page.url);
	},
	unbindBeforeUnload: function() {
		window.onbeforeunload = null;
		try {
			if(jQuery || $) {
				$(window).off('beforeunload');
			}
		} catch(e) {}
	},
	waitForUnbindingBeforeLoad: function() {
		var iaPageLoaded = document.readyState === 'complete' &&
			performance.timing.loadEventEnd &&
			performance.timing.loadEventEnd > 0;

		if(iaPageLoaded) {
			var jQueryScript = document.querySelector('script[src*="jquery"]');
			if(jQueryScript && jQueryScript.length > 0) {
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
		return func.toString();
	},
	executeScript: function (func) {
		return this.driver.executeScript('return (' + this.func2str(func) + '());');
	},
	executeAsyncScript: function (func) {
		return this.driver.executeAsyncScript('(' + this.func2str(func) + '())');
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
		return `./output/${this.platform}/${this.cap.os}/${this.cap.browserName}/${fileName}`;
	},
	end: function() {
		return this.driver.quit().then(function () {
			if(this.isSauceLabs) {
				let sauceLabs = new SauceLabs({
					username: this.cap.username,
					password: this.cap.accessKey
				});
				return sauceLabs.updateJob(
					this.driver.sessionID, {
						name: this.browserCap.name,
						passed: true//TODO: fix
					}
				);
			}

			console.log('\n\n')
			console.timeEnd(this.testLabel);

		}.bind(this));
	}
};

module.exports = Browser;