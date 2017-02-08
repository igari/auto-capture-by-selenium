"use strict";

const assert = require("assert");
const path = require("path");
const fs = require("fs");
const childProcess = require('child_process');

const webdriver = require("selenium-webdriver");
const By = webdriver.By;
const until = webdriver.until;

const chrome = require("selenium-webdriver/chrome");
const Capture = require("./capture.js");
const SauceLabs = require("saucelabs");
const selenium = require('selenium-standalone');
const defaultConfig = require('selenium-standalone/lib/default-config.js');
const browserstack = require('browserstack-local');
const FirefoxProfile = require('firefox-profile');

const colors = require('colors');

colors.setTheme({
	silly: 'rainbow',
	input: 'grey',
	verbose: 'cyan',
	prompt: 'grey',
	info: 'green',
	data: 'grey',
	help: 'cyan',
	warn: 'yellow',
	debug: 'blue',
	error: 'red'
});

require('./fast-selenium.js');

function Browser(pages, cap) {

	this.pages = pages;
	this.cap = cap;
	this.options = Object.assign(defaultConfig, {
		logger: function(message) {
			console.log(message);
		}
	});
}

Browser.prototype = {

	run: function () {

		console.log(`
 _______  _______  _______  ___   __   __  __   __
|       ||   _   ||       ||   | |  | |  ||  |_|  |
|       ||  |_|  ||    _  ||   | |  | |  ||       |
|       ||       ||   |_| ||   | |  |_|  ||       |
|      _||       ||    ___||   | |       ||       |
|     |_ |   _   ||   |    |   | |       || ||_|| |
|_______||__| |__||___|    |___| |_______||_|   |_| v0.6.21

		`)

		this.setParameters();
		this.bindEvents();

		if(this.remoteTesingServer && !this.cap.os) {
			throw new Error('OS is not defined.');
		}

		return Promise.all([
				this.startBrowserStackLocal(),
				this.startSeleniumStandAlone()
			])
			.then(this.prepareDriver4Local.bind(this))
			.then(function() {
				//Before
				return this.launchBrowser()
					.then(function () {

						console.log(
							'====================================\n' +
							this.testLabel + '\n' +
							'===================================='
						);

						let promises = [];

						//Main
						this.pages.forEach(function (page) {
							console.time('end: ' + page.url);
							let promise = this.executeCapture(page)
								.then(function () {
									console.log('\n- - - - - - - - - - - - - - - ');
									console.timeEnd('end: ' + page.url);
									console.log('- - - - - - - - - - - - - - - ');
								});
							promises.push(promise);
						}.bind(this));

						return Promise.all(promises);
					}.bind(this))
					//After
					.then(this.end.bind(this))
					.then(function () {
						if(this.childProcessOfSeleniumStandAlone) {
							this.childProcessOfSeleniumStandAlone.kill();
						}
					}.bind(this))
					.catch(function () {
						if(this.childProcessOfSeleniumStandAlone) {
							this.childProcessOfSeleniumStandAlone.kill();
						}
					}.bind(this));

			}.bind(this));
	},

	prepareDriver4Local: function () {
		if(this.remoteTesingServer) {
			return Promise.resolve();
		}
		return Promise.all([
			this.setChromeDriver(),
			this.setGeckoDriver(),
			this.setFirefoxProfile()
		]);
	},

	setParameters: function () {

		this.isSauceLabs = this.cap.username && this.cap.accessKey;
		this.isBrowserStack = this.cap['browserstack.user']	&& this.cap['browserstack.key'];
		this.isLocal = !this.isBrowserStack && !this.isSauceLabs;

		if(this.isSauceLabs) {
			this.platform = 'saucelabs'
		}
		if(this.isBrowserStack) {
			this.platform = 'browserstack'
		}
		if(this.isLocal) {
			this.platform = /^win/.test(process.platform) ? 'windows' : 'mac';
		}

		this.isMobileOS = /android|android_emulator|ios|ios_emulator/.test(this.cap.os);

		switch(this.platform) {
			case 'browserstack':
				let browserStackServer = 'http://hub-cloud.browserstack.com/wd/hub';
				this.remoteTesingServer = browserStackServer;
				break;
			case 'saucelabs':
				let sauceLabsServer = "http://" + this.cap.username + ":" + this.cap.accessKey + "@ondemand.saucelabs.com:80/wd/hub";
				this.remoteTesingServer = sauceLabsServer;
				break;
			default:
				break;
		}

		this.pathOfSeleniumStandalone = path.join(__dirname, '../../../', `/node_modules/selenium-standalone/.selenium`);
		this.pathOfSeleniumStandalone4dev = path.join(__dirname, '../', `/node_modules/selenium-standalone/.selenium`);
	},

	bindEvents: function () {
		process.on('SIGINT', function() {
			if(this.childProcessOfSeleniumStandAlone) {
				this.childProcessOfSeleniumStandAlone.kill()
			}
			console.log('!!!!!!!!!process is killed!!!!!!!!!');
			process.exit();
		}.bind(this));
	},

	startBrowserStackLocal: function () {
		if(this.cap['browserstack.local']) {
			this.bs_local = new browserstack.Local();
			this.bs_local_args = {
				'key': this.cap['browserstack.key'],
				'force': 'true',
				'parallelRuns': 2,
				'onlyAutomate': true,
				'logFile': './browserStackLocal.txt'
			};

			return new Promise(function (resolve) {
				this.bs_local.start(this.bs_local_args, function() {
					console.log("\n**** Started BrowserStackLocal ****");
					resolve();
				});
			}.bind(this))
		} else {
			return Promise.resolve();
		}
	},

	setFirefoxProfile: function () {

		return Promise.resolve();

		// if(this.cap.browserName !== 'firefox') {
		// 	return Promise.resolve();
		// }
		//
		// return new Promise(function (resolve) {
		// 	let myProfile = new FirefoxProfile();
		//
		// 	myProfile.setPreference('plugin.state.flash', 0);
		// 	myProfile.updatePreferences();
		//
		// 	myProfile.encoded(function(encodedProfile) {
		// 		this.firefoxProfile = encodedProfile;
		// 		resolve(this.firefoxProfile)
		// 	}.bind(this));
		// }.bind(this));
	},

	getPathOfSeleniumStandalone: function () {
		return new Promise(function (resolve) {

			fs.stat(this.pathOfSeleniumStandalone4dev, function (err, data) {
				if(err || !data.isDirectory()) {
					fs.stat(this.pathOfSeleniumStandalone, function (err, data) {
						if(err || !data.isDirectory()) {
							resolve('');
						} else {
							resolve(this.pathOfSeleniumStandalone)
						}
					}.bind(this));
				} else {
					resolve(this.pathOfSeleniumStandalone4dev);
				}
			}.bind(this));
		}.bind(this));
	},

	setChromeDriver: function () {
		
		if(this.cap.browserName !== 'chrome') {
			return Promise.resolve();
		}

		return this.getPathOfSeleniumStandalone()
			.then(function (pathOfSeleniumStandalone) {
				let chromeDriverPath = '';

				if(pathOfSeleniumStandalone) {
					chromeDriverPath = pathOfSeleniumStandalone + `/chromedriver/${this.options.drivers.chrome.version}-${this.options.drivers.chrome.arch}-chromedriver`;
					chrome.setDefaultService(new chrome.ServiceBuilder(chromeDriverPath).build());
				}

				console.log('\n------------------------------');
				if (chromeDriverPath) {
					console.log('Chromedriver is set.\n\n' + chromeDriverPath)
				} else {
					console.log('Chromedriver could not set. So Chromedriver of your environment is going to be used.')
				}
				console.log('------------------------------');
			}.bind(this));

	},

	setGeckoDriver: function () {

		if(this.remoteTesingServer || this.platform === 'windows' || this.cap.browserName !== 'firefox') {
			return Promise.resolve();
		}

		return this.getPathOfSeleniumStandalone()
			.then(function (pathOfSeleniumStandalone) {
				let geckoDriverPath = '';
				let newGeckoDriverPath = '';
				if(pathOfSeleniumStandalone) {
					let geckoDriverPathDir = pathOfSeleniumStandalone + '/geckodriver';
					geckoDriverPath = `${geckoDriverPathDir}/${this.options.drivers.firefox.version}-${this.options.drivers.firefox.arch}-geckodriver`;
					newGeckoDriverPath = `${geckoDriverPathDir}/geckodriver`;
					try {
						childProcess.execSync(`ln -sf ${geckoDriverPath} ${newGeckoDriverPath}`);
						process.env.PATH = `${process.env.PATH}:${geckoDriverPathDir}`;
					} catch(e) {
						console.error(e)
					}
				}
				return newGeckoDriverPath;
			}.bind(this));
	},

	startSeleniumStandAlone: function () {

		if(this.remoteTesingServer) {
			return Promise.resolve();e
		} else {
			return new Promise(function (resolve) {
				selenium.install(this.options, function () {
					selenium.start(this.options, function (err, child) {
						if(err) throw err;
						this.childProcessOfSeleniumStandAlone = child;
						resolve(child);
					}.bind(this));
				}.bind(this));
			}.bind(this))
		}
	},

	launchBrowser: function() {
		
		this.setBrowserCaps();

		this.testLabel = 'get screenshots / ' + this.cap.browserName + ' on ' + this.cap.os + ' with ' + this.platform;
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

		switch(this.platform) {
			case 'browserstack':
				let capsBrowserStack = require('./caps-browserstack.js').bind(this);
				let capsBrowserStackCommon = capsBrowserStack().common;
				let capsBrowserStackBrowser = capsBrowserStack().browsers[this.cap.os][this.cap.browserName]	|| {};
				Object.assign(this.cap, this.commonCap, capsBrowserStackCommon, capsBrowserStackBrowser);
				break;
			case 'saucelabs':
				let capsSauceLabs = require('./caps-saucelabs.js').bind(this);
				let capsSauceLabsCommon = capsSauceLabs().common;
				let capsSauceLabsBrowser = capsSauceLabs().browsers[this.cap.os][this.cap.browserName]	|| {};
				Object.assign(this.cap, this.commonCap, capsSauceLabsCommon, capsSauceLabsBrowser);
				break;
			default:
				this.cap.os = this.platform;
				const capsLocal = require('./caps-local.js').bind(this);
				const capsLocalBrowser = capsLocal().browsers[this.cap.os][this.cap.browserName]	|| {};
				Object.assign(this.cap, this.commonCap, capsLocalBrowser);
				break;
		}

		console.log('\n----------');
		console.log('capability');
		console.log('----------');
		console.log(this.cap);
	},
	buildBrowser: function () {

		try {
			if(this.remoteTesingServer) {
				this.driver = new webdriver.Builder()
					.withCapabilities(this.cap)
					.usingServer(this.remoteTesingServer)
					.build();
			} else {
				this.driver = new webdriver.Builder()
					.withCapabilities(this.cap)
					.build();
			}
		} catch(e) {
			console.error(e);
			if(this.childProcessOfSeleniumStandAlone) {
				this.childProcessOfSeleniumStandAlone.kill();
			}

		}


		return typeof this.driver.then === 'function' ? this.driver : Promise.resolve();
	},

	initialConfig: function() {

		let timeouts = this.driver.manage().timeouts();
		return Promise.resolve()
			.then(function () {
				if(this.isSauceLabs && this.isMobileOS) {
					this.driver.context('NATIVE_APP');
				}
			}.bind(this))
			.then(timeouts.implicitlyWait.bind(timeouts, 60/*m*/*60/*s*/*1000/*ms*/))
			.then(timeouts.setScriptTimeout.bind(timeouts, 60/*m*/*60/*s*/*1000/*ms*/))
			.then(timeouts.pageLoadTimeout.bind(timeouts, 60/*m*/*60/*s*/*1000/*ms*/))
			.then(function () {
				if(!this.isMobileOS) {
					return this.driver.manage().window().setSize(+this.cap.width || 1024, +this.cap.height || 768);
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

				console.log('\n- - - - - - - - - - - - - - - ');
				console.log('start: ' + page.url)
				console.log('- - - - - - - - - - - - - - - \n');

				let hasBasicAuthInURL = page.url.match(/https?:\/\/.+:.+@.+/);
				if (hasBasicAuthInURL && !this.isBrowserStack && /safari/.test(this.cap.browserName)) {
					return this.driver.wait(until.elementLocated(By.id('ignoreWarning')), 10/*s*/*1000/*ms*/, 'The button could not found.')
						.then(function (button) {
							return button.click();
						}.bind(this))
						.then(this.driver.sleep.bind(this.driver, 1/*s*/*1000/*ms*/))
						.then(console.log.bind(null, 'Clicked a button to ignore'));
				}
			}.bind(this))
			.then(function () {
				if(typeof page.wd === 'function') {
					return page.wd.bind(this)(this.driver, webdriver)
				}
			}.bind(this))
			.then(function () {
				if(typeof page.wd === 'function') {
					console.log('[page specified function]\tdone');
				}
			}.bind(this))
			.then(function () {
				let timeout = 60/*s*/ * 1000/*ms*/;
				let timeoutMsg = 'unbinding could not be completed.';
				return this.driver.wait(this.executeScript(this.waitForUnbindingBeforeLoad), timeout, timeoutMsg)
					.then(function () {
						console.log('[wait for unbinding before load]\tdone');
					});
			}.bind(this))
			.then(function () {
				return this.executeScript(this.unbindBeforeUnload)
					.then(function () {
						console.log('[unbind before unload]\tdone');
					});
			}.bind(this))
			.then(function () {
				if(this.isMobileOS) {
					if (/android|safari/i.test(this.cap.browserName.toLowerCase())) {
						return capture.saveFullScreenShot(captureUrl);
					} else {
						return capture.saveScreenShot(captureUrl);
					}
				} else {
					if (/chrome|edge|ie|firefox/i.test(this.cap.browserName.toLowerCase())) {
						return capture.saveFullScreenShot(captureUrl);
					} else {
						return capture.saveScreenShot(captureUrl);
					}
				}
			}.bind(this))
			.catch(function (error) {

				console.error(error);
				// assert(false, error);
				// throw new Error(error);
			});
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
		let argsArray = [];
		let originalArgs = Array.prototype.slice.call(arguments);

		originalArgs = originalArgs.slice(1);

		for(let arg of originalArgs) {
			let _arg = typeof arg === 'string' ? '\"' + arg + '\"' : arg;
			argsArray.push(_arg)
		}

		let argsString = argsArray.join(',');

		return this.driver.executeScript('return (' + this.func2str(func) + '(' + argsString + '));');
	},
	executeAsyncScript: function (func) {
		let argsString = '';
		let argsArray = [];
		let callbackString = 'arguments[arguments.length-1]';
		let originalArgs = Array.prototype.slice.call(arguments);

		originalArgs = originalArgs.slice(1);

		for(let arg of originalArgs) {
			let _arg = typeof arg === 'string' ? '\"' + arg + '\"' : arg;
			argsArray.push(_arg)
		}

		if(argsArray.length > 0) {
			argsString = argsArray.join(',') + ',' + callbackString;
		} else {
			argsString = callbackString;
		}

		return this.driver.executeAsyncScript('(' + this.func2str(func) + '(' + argsString + '));');
	},
	getImageFileName: function(url) {
		return url.split('://')[1].replace(/\/$/, '').replace(/\//g, '_') + '.png';
	},
	getDestPath: function(fileName) {
		return `./output/${this.platform}/${this.cap.os.toLowerCase().replace(/\s/g, '_')}/${this.cap.browserName}/${fileName}`;
	},
	end: function() {

		return this.driver.quit()
			.then(function () {
				if(this.isSauceLabs) {
					let sauceLabs = new SauceLabs({
						username: this.cap.username,
						password: this.cap.accessKey
					});
					return sauceLabs.updateJob(
						this.driver.sessionID, {
							name: this.cap.name,
							passed: true//TODO: fix
						}
					);
				}
			}.bind(this))
			.then(function () {
				if(this.cap['browserstack.local']) {
					return new Promise(function (resolve) {
						this.bs_local.stop(function() {
							console.log("\n****Stopped BrowserStackLocal****\n");
							resolve();
						});
					}.bind(this));
				}
			}.bind(this))
			.then(function () {
				// for(let process of this.processArray) {
				// 	process.kill();
				// }
			}.bind(this))
			.then(function () {
				console.log('\n\n')
				console.timeEnd(this.testLabel);
			}.bind(this));
	}
};

module.exports = Browser;