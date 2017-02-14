"use strict";

const assert = require("assert");
const path = require("path");
const fs = require("fs");
const childProcess = require('child_process');
const util = require('./util.js');
const packageJSON = require('../package.json');
const git = require('git-rev');
const selenium = require('selenium-standalone');
const ssDefaultConfig = require('selenium-standalone/lib/default-config.js');
const webdriver = require("selenium-webdriver");
const until = webdriver.until;
const By = webdriver.By;
const SauceLabs = require("saucelabs");
const browserstack = require('browserstack-local');
const chrome = require("selenium-webdriver/chrome");
const FirefoxProfile = require('firefox-profile');

const Capture = require("./capture.js");
require('./fast-selenium.js');

function Browser(pages, cap, options, timestamp) {

	this.pages = pages;
	this.cap = cap;
	this.options = options;
	this.timestamp = timestamp;
	this.ssConfig = Object.assign(ssDefaultConfig, {
		// logger: function(message) {
		// 	console.log(message);
		// }
	});
}

Browser.prototype = {

	run: function () {

		console.log(util.colors.silly(`
 _______  _______  _______  ___   __   __  __   __
|       ||   _   ||       ||   | |  | |  ||  |_|  |
|       ||  |_|  ||    _  ||   | |  | |  ||       |
|       ||       ||   |_| ||   | |  |_|  ||       |
|      _||       ||    ___||   | |       ||       |
|     |_ |   _   ||   |    |   | |       || ||_|| |
|_______||__| |__||___|    |___| |_______||_|   |_|
v${packageJSON.version}

		`));

		this.setParameters();
		this.bindEvents();

		if(this.remoteTesingServer && !this.os) {
			throw new Error('Remote Selenium requires OS property.');
		}

		this.dotsTimer = this.loadingDots();

		//Before
		return Promise.all([
				this.getGitRev(),
				this.startSauceConnect(),
				this.startBrowserStackLocal(),
				this.startSeleniumStandAlone()
			])
			.then(function () {
				clearInterval(this.dotsTimer);
			}.bind(this))
			.then(this.prepareDriver4Local.bind(this))
			.then(this.launchBrowser.bind(this))
			//Main
			.then(function () {

				this.testLabel = this.browserName + ' on ' + this.os + ' with ' + this.platform;
				console.log('');
				console.log('========================================');
				console.log(util.colors.bold(this.testLabel));
				console.time(this.testLabel);
				console.log('========================================');

				let promises = [];

				this.pages.forEach(function (page) {

					console.time(util.colors.help('[end]' + page.url));
					let promise = this.executeCapture(page)
						.then(function () {
							console.timeEnd(util.colors.help('[end]' + page.url));
							console.log('------------------------------------')
						});
					promises.push(promise);
				}.bind(this));

				return Promise.all(promises);
			}.bind(this))
			//After
			.then(this.end.bind(this))
			.catch(function (error) {
				util.throwError(error);
				return this.killProcesses();
			}.bind(this));
	},

	getGitRev: function () {
		let promises = [];
		promises.push(new Promise(git.short));
		promises.push(new Promise(git.long));
		promises.push(new Promise(git.branch));
		promises.push(new Promise(git.tag));
		return Promise.all(promises).then(function (dataArray) {
			this.git = {
				short: dataArray[0],
				long: dataArray[1],
				branch: dataArray[2],
				tag: dataArray[3]
			};
			return this.git;
		}.bind(this))
	},

	loadingDots: function () {
		if(this.remoteTesingServer) {
			return;
		}
		process.stdout.write('Selenium Server is starting');
		let dots = '.';
		return setInterval(function () {
			process.stdout.write(dots);
			dots += '.'
		}, 1000);
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

		this.isSauceLabs = !!this.cap.username && !!this.cap.accessKey;
		this.isBrowserStack = !!this.cap['browserstack.user'] && !!this.cap['browserstack.key'];
		this.isLocal = !this.isBrowserStack && !this.isSauceLabs;

		if(this.isSauceLabs) {
			this.platform = 'saucelabs'
		}
		if(this.isBrowserStack) {
			this.platform = 'browserstack'
		}
		if(this.isLocal) {
			this.cap._os = /^win/.test(process.platform) ? 'windows' : 'mac';
			this.platform = 'local';
		}

		this.hasSpecialPropertyKey = !!this.cap._os && !!this.cap._browserName;
		this.browserName = this.cap._browserName || this.cap.browserName;
		this.os = this.cap._os || this.cap.os;

		this.isMobileOS = /android|android_emulator|ios|ios_emulator/.test(this.cap._os);

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

		this.pathOfSeleniumStandalone = path.join(__dirname, '../../../', '/node_modules/selenium-standalone/.selenium');
		this.pathOfSeleniumStandalone4dev = path.join(__dirname, '../', '/node_modules/selenium-standalone/.selenium');
	},

	bindEvents: function () {
		process.on('SIGINT', function() {
			this.killProcesses()
				.then(function () {
					console.log('');
					console.log('!!!!!!!!!process is killed!!!!!!!!!');
					console.log('');
					process.exit();
				});
		}.bind(this));
		process.on('unhandledRejection', function (message) {
			util.throwError(message);
			process.exit(1);
		});
	},

	killProcesses: function () {
		let promises = [Promise.resolve()];

		if(this.driver && this.driver.sessionID) {
			this.driver.quit();
		}

		if(this.childProcessOfSeleniumStandAlone) {
			this.childProcessOfSeleniumStandAlone.kill();
		}

		if(this.isBrowserStackLocal) {
			promises.push(
				new Promise(function (resolve) {
					this.bs_local.stop(function() {
						console.log('');
						console.log("****Closed BrowserStackLocal Process****");
						console.log('');
						resolve();
					});
				}.bind(this))
			);
		}
		if(this.sauceConnectProcess) {
			promises.push(
				new Promise(function (resolve) {
					this.sauceConnectProcess.on('close', function (code) {
						console.log('');
						console.log("****Closed Sauce Connect process****");
						console.log('');
						resolve();
					});
					this.sauceConnectProcess.kill();
				}.bind(this))
			);
		}

		return Promise.all(promises).then(function () {
			if(this.sauceConnectProcess) {
				process.exit(0);
			}
		}.bind(this));
	},

	startSauceConnect: function () {

		if(!this.isSauceLabs) {
			return Promise.resolve();
		}

		// if(this.isIncludedLocalostInURL) {
		// 	this.cap.sauceConnect = true;
		// }

		if(!this.cap.sauceConnect) {
			return Promise.resolve();
		}

		return new Promise(function (resolve) {

			let sauceConnectPath = path.join(__dirname, '../', './util/sc-4.4.3-osx/bin/sc');
			this.sauceConnectProcess = childProcess.spawn(
				sauceConnectPath,
				[`-u`, this.cap.username, `-k`, this.cap.accessKey] ,
				{
					detached: true
				},
				function (err, child) {
					if(err) {
						throw err;
					}
					child.kill();
				}.bind(this)
			);

			console.log('');
			console.log("**** Started Sauce Connect Process ****");
			console.log('');

			this.sauceConnectProcess.stdout.on('data', function (data) {
				console.log('stdout: ' + data.toString());
				if(data.toString().indexOf('Sauce Connect is up, you may start your tests.') > -1) {
					resolve();
				}
			});
		}.bind(this));

		// return new Promise(function (resolve) {
		// 	sauceConnectLauncher({
		// 		// Sauce Labs username.  You can also pass this through the
		// 		// SAUCE_USERNAME environment variable
		// 		username: this.cap['username'],
		//
		// 		// Sauce Labs access key.  You can also pass this through the
		// 		// SAUCE_ACCESS_KEY environment variable
		// 		accessKey: this.cap['accessKey'],
		//
		// 		// Log output from the `sc` process to stdout?
		// 		verbose: true,
		//
		// 		// A function to optionally write sauce-connect-launcher log messages.
		// 		// e.g. `console.log`.  (optional)
		// 		logger: function (message) {console.log(message)}
		//
		// 	}, function(err, sauceConnectProcess) {
		// 		if(err) {
		// 			throw err;
		// 		}
		// console.log('');
		// 		console.log("**** Started Sauce Connect Process ****");
		// console.log('');
		// 		this.sauceConnectProcess = sauceConnectProcess;
		// 		resolve();
		// 	}.bind(this));
		// }.bind(this))
	},

	startBrowserStackLocal: function () {

		if(!this.isBrowserStack) {
			return Promise.resolve();
		}

		if(!this.cap['browserstack.local']) {
			return Promise.resolve();
		}

		if(!this.cap['browserstack.key']) {
			throw new Error('To test on local server, specify browserstack.key');
		}

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
				console.log('');
				console.log("**** Started BrowserStackLocal Process ****");
				console.log('');
				this.isBrowserStackLocal = true;
				resolve();
			}.bind(this));
		}.bind(this))

	},

	setFirefoxProfile: function () {

		return Promise.resolve();

		if(this.browserName !== 'firefox') {
			return Promise.resolve();
		}

		return new Promise(function (resolve) {
			let myProfile = new FirefoxProfile();

			myProfile.setPreference('plugin.state.flash', 0);
			myProfile.updatePreferences();

			myProfile.encoded(function(encodedProfile) {
				this.cap['firefox_profile'] = encodedProfile;
				resolve();
			}.bind(this));
		}.bind(this));
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

		if(this.browserName !== 'chrome') {
			return Promise.resolve();
		}

		return this.getPathOfSeleniumStandalone()
			.then(function (pathOfSeleniumStandalone) {
				let chromeDriverPath = '';
				let newChromeDriverPath = '';

				if(pathOfSeleniumStandalone) {
					let chromeDriverPathDir = pathOfSeleniumStandalone + '/chromedriver';
					chromeDriverPath = `${chromeDriverPathDir}/${this.ssConfig.drivers.chrome.version}-${this.ssConfig.drivers.chrome.arch}-chromedriver`;
					newChromeDriverPath = `${chromeDriverPathDir}/chromedriver`;
					childProcess.execSync(`ln -sf ${chromeDriverPath} ${newChromeDriverPath}`);
					process.env.PATH = `${process.env.PATH}:${chromeDriverPath}`;

					try {
						childProcess.execSync(`ln -sf ${chromeDriverPath} ${newChromeDriverPath}`);
						process.env.PATH = `${process.env.PATH}:${chromeDriverPathDir}`;
						console.log('')
						console.log('----------------------------------------');
						console.log('chromedriver')
						console.log('----------------------------------------');
						console.log(util.colors.data(`${newChromeDriverPath}\n>>> ${chromeDriverPath}`));

					} catch(error) {
						console.log(util.colors.error(error));
					}
				}
				
				return newChromeDriverPath;
			}.bind(this));
	},

	setGeckoDriver: function () {

		if(this.browserName !== 'firefox') {
			return Promise.resolve();
		}

		return this.getPathOfSeleniumStandalone()
			.then(function (pathOfSeleniumStandalone) {
				let geckoDriverPath = '';
				let newGeckoDriverPath = '';

				if(pathOfSeleniumStandalone) {
					let geckoDriverPathDir = pathOfSeleniumStandalone + '/geckodriver';
					geckoDriverPath = `${geckoDriverPathDir}/${this.ssConfig.drivers.firefox.version}-${this.ssConfig.drivers.firefox.arch}-geckodriver`;
					newGeckoDriverPath = `${geckoDriverPathDir}/geckodriver`;
					try {
						childProcess.execSync(`ln -sf ${geckoDriverPath} ${newGeckoDriverPath}`);
						process.env.PATH = `${process.env.PATH}:${geckoDriverPathDir}`;
						console.log('');
						console.log('----------------------------------------');
						console.log('geckodriver')
						console.log('----------------------------------------');
						console.log(util.colors.data(`${newGeckoDriverPath}\n>>> ${geckoDriverPath}`));

					} catch(error) {
						console.log(util.colors.error(error));
					}
				}
				return newGeckoDriverPath;
			}.bind(this));
	},


	startSeleniumStandAlone: function () {

		if(this.remoteTesingServer) {
			return Promise.resolve();
		} else {
			return new Promise(function (resolve) {
				selenium.install(this.ssConfig, function () {
					selenium.start(this.ssConfig, function (err, child) {
						if(err) throw err;
						this.childProcessOfSeleniumStandAlone = child;
						resolve(child);
					}.bind(this));
				}.bind(this));
			}.bind(this))
		}
	},

	launchBrowser: function() {
		
		return this.mergeCaps()
			.then(this.buildBrowser.bind(this))
			.then(this.initialConfig.bind(this));
	},

	mergeCaps: function () {

		this.commonCap = {
			"unexpectedAlertBehaviour": "ignore",
			"locationContextEnabled": false,
			"webStorageEnabled": true
		};
		Object.assign(this.cap, this.commonCap);

		if(this.hasSpecialPropertyKey) {
			switch(this.platform) {
				case 'browserstack':
					let capsBrowserStack = require('./caps-browserstack.js').bind(this);
					let capsBrowserStackCommon = capsBrowserStack().common;
					let capsBrowserStackBrowser = capsBrowserStack().browsers[this.cap._os][this.cap._browserName];
					Object.assign(this.cap, capsBrowserStackCommon, capsBrowserStackBrowser);
					break;
				case 'saucelabs':
					let capsSauceLabs = require('./caps-saucelabs.js').bind(this);
					let capsSauceLabsCommon = capsSauceLabs().common;
					let capsSauceLabsBrowser = capsSauceLabs().browsers[this.cap._os][this.cap._browserName];
					Object.assign(this.cap, capsSauceLabsCommon, capsSauceLabsBrowser);
					break;
				default:
					const capsLocal = require('./caps-local.js').bind(this);
					const capsLocalBrowser = capsLocal().browsers[this.cap._os][this.cap._browserName];
					Object.assign(this.cap, capsLocalBrowser);
					break;
			}

		}

		let capability2pass = Object.assign({}, this.cap);
		delete capability2pass._browserName;
		delete capability2pass._os;

		console.log('');
		console.log('----------------------------------------');
		console.log('capability'.bold);
		console.log('----------------------------------------');
		console.log(capability2pass);

		return Promise.resolve(capability2pass);
	},
	buildBrowser: function (capability2pass) {

		try {
			if(this.remoteTesingServer) {
				this.driver = new webdriver.Builder()
					.withCapabilities(capability2pass)
					.usingServer(this.remoteTesingServer)
					.build();
			} else {
				this.driver = new webdriver.Builder()
					.withCapabilities(capability2pass)
					.build();
			}
		} catch(error) {
			console.log(util.colors.error(error));
			return this.killProcesses();
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

				console.log(util.colors.help('[start]' + page.url))

				let hasBasicAuthInURL = page.url.match(/https?:\/\/.+:.+@.+/);
				if (hasBasicAuthInURL && !this.isBrowserStack && /safari/.test(this.browserName)) {
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
					console.log('[page specified function]', util.colors.data('done'));
				}
			}.bind(this))
			.then(function () {
				let timeout = 60/*s*/ * 1000/*ms*/;
				let timeoutMsg = 'unbinding could not be completed.';
				return this.driver.wait(this.executeScript(this.waitForUnbindingBeforeLoad), timeout, timeoutMsg)
					.then(function () {
						console.log('[wait for unbinding before load]', util.colors.data('done'));
					});
			}.bind(this))
			.then(function () {
				return this.executeScript(this.unbindBeforeUnload)
					.then(function () {
						console.log('[unbind before unload]', util.colors.data('done'));
					});
			}.bind(this))
			.then(function () {
				if(this.isMobileOS) {
					if (/android|safari/i.test(this.browserName.toLowerCase())) {
						return capture.saveFullScreenShot(captureUrl);
					} else {
						return capture.saveScreenShot(captureUrl);
					}
				} else {
					if (/chrome|edge|ie|firefox/i.test(this.browserName.toLowerCase())) {
						return capture.saveFullScreenShot(captureUrl);
					} else {
						return capture.saveScreenShot(captureUrl);
					}
				}
			}.bind(this));
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
		let dir = `${this.options.distDir.path}`;
		if(this.git.short) {
			dir += `/${this.git.short}`
		}
		if(this.options.distDir.timestamp) {
			dir += `/${this.timestamp}`
		}
		return `./${dir}/${this.platform}/${this.os.toLowerCase().replace(/\s/g, '_')}/${this.browserName}/${fileName}`;

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
				this.driver.sessionID = null;
			}.bind(this))
			.then(this.killProcesses.bind(this))
			.then(function () {
				console.log('');
				console.log('');
				console.timeEnd(this.testLabel);
			}.bind(this))
	}
};

module.exports = Browser;