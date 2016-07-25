const path = require('path');
const mkdirp = require('mkdirp');
const webdriver = require('selenium-webdriver');

const CaptureJson = require('./input/capture-list.json');
const Capture = require('./scripts/capture');

const BASIC_AUTH = {
	ID: '',
	PASS: ''
};
const BROWSER = {
	CHROME: 'chrome',
	FF: 'firefox',
	IE: 'ie'
};
const DEVICE = {
	PC: 'pc',
	SP: 'sp'
};
const PATH = {
	DEST_DIR: './output/'
};

var WebDriver = {
	init: function() {
		var _this = this;
		this.start();
		this.setParameters();
		this.initialConfig()
			.then(function() {
				return _this.capturePages();
			})
			.then(function() {
				_this.end();
			});
	},
	setParameters: function() {
		this.captureList = this.getCaptureList(DEVICE.PC);
		this.currentBrowser = process.argv[2] || BROWSER.FF;

		var driver = new webdriver.Builder().usingServer('http://localhost:4444/wd/hub');
		switch (this.currentBrowser) {
			case BROWSER.CHROME:
				driver.withCapabilities(webdriver.Capabilities.chrome());
				break;
			case BROWSER.FF:
				driver.withCapabilities(webdriver.Capabilities.firefox());
				break;
			case BROWSER.IE:
				driver.withCapabilities(webdriver.Capabilities.ie());
				break;
		}
		this.driver = driver.build();
	},
	initialConfig: function() {
		var _this = this;
		return new Promise(function(resolve, reject) {
			_this.driver.manage().timeouts().implicitlyWait(5000)
				.then(function() {
					resolve();
				});
		});
	},
	capturePages: function() {
		var _this = this;
		var _resolve;
		var _reject;

		var _capturePages = function(index) {
			var isLast = index === _this.captureList.length - 1;
			_this.executeCapture(_this.captureList[index], BASIC_AUTH.ID, BASIC_AUTH.PASS)
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
	executeCapture: function(url, basicId, basicPass) {
		var _this = this;
		var capture = new Capture(this.driver);
		var captureUrl = this.getDestPath(this.getImageFileName(url));

		return new Promise(function(resolve, reject) {
			if (basicId && basicPass) {
				_this.driver.get(_this.getUrlForBasicAuth(url, basicId, basicPass));
			} else {
				_this.driver.get(url);
			}

			switch (_this.currentBrowser) {
				case BROWSER.CHROME:
					capture.saveFullScreenShot(captureUrl).then(function() {
						resolve();
					});
					break;
				case BROWSER.FF:
				case BROWSER.IE:
				default:
					capture.saveScreenShot(captureUrl).then(function() {
						resolve();
					});
			}
		});
	},
	getCaptureList: function(deviceType) {
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
		url = url.replace('http://', '');
		return `http://${id}:${pass}@${url}/`;
	},
	getImageFileName: function(url) {
		return url.replace(/http.*:\/\//, '').replace(/\//g, '_') + '.png';
	},
	getDestPath: function(fileName) {
		return `${PATH.DEST_DIR}${this.currentBrowser}/${fileName}`;
	},
	start: function() {
		console.time('Processing Time');
	},
	end: function() {
		this.driver.quit();
		console.log('---- COMPLETE ----');
		console.timeEnd('Processing Time');
	}
};

WebDriver.init();
