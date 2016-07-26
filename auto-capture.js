const argv = require('argv');
const path = require('path');
const mkdirp = require('mkdirp');
const webdriver = require('selenium-webdriver');

const CaptureJson = require('./input/capture-list.json');
const Capture = require('./scripts/capture');

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
		this.setOptions();
		this.setParameters();
		this.initialConfig()
			.then(function() {
				return _this.capturePages();
			})
			.then(function() {
				_this.end();
			});
	},
	setOptions: function() {
		argv.option({
			name: 'browser',
			short: 'b',
			type: 'string',
			description: '起動するブラウザを選択します。選択肢は[chrome, firefox, ie]のいずれかです。',
			example: `'node auto-capture.js --browser=chrome'`
		});
		argv.option({
			name: 'basicId',
			short: 'bid',
			type: 'string',
			description: 'Basic認証が必要な場合にID（ユーザー名）を指定します。',
			example: `'node auto-capture.js --basicid=id --basicpadd=pass'`
		});
		argv.option({
			name: 'basicPass',
			short: 'bpass',
			type: 'string',
			description: 'Basic認証が必要な場合にパスワードを指定します。',
			example: `'node auto-capture.js --basicid=id --basicpadd=pass'`
		});
	},
	setParameters: function() {
		this.argv = argv.run();
		this.basicAuth = {
			id: this.argv.options.basicId,
			pass: this.argv.options.basicPass
		};
		this.captureList = this.getCaptureList(DEVICE.PC);
		this.currentBrowser = this.argv.options.browser || BROWSER.FF;

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
		var _this = this;
		var capture = new Capture(this.driver);
		var captureUrl = this.getDestPath(this.getImageFileName(url));

		return new Promise(function(resolve, reject) {
			if (_this.basicAuth.id && _this.basicAuth.pass) {
				_this.driver.get(_this.getUrlForBasicAuth(url, _this.basicAuth.id, _this.basicAuth.pass));
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
