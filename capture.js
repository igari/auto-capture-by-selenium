const argv = require('argv');
const webdriver = require('selenium-webdriver');

const CaptureJson = require('./input/capture-list.json');
const Capture = require('./scripts/capture');

const BROWSER = {
	CHROME: 'chrome',
	FF: 'firefox',
	IE: 'ie'
};

const WebDriver = function( driver ) {
	this.driver = driver;
	this.init();
};
WebDriver.prototype = {
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
			}, function() {
				console.log('ERROR: faild capturePages.');
				_this.end();
			});
	},
	setOptions: function() {
		argv.option([
		{
			name: 'browser',
			short: 'b',
			type: 'string',
			description: '起動するブラウザを選択します。選択肢は[chrome, firefox, ie]のいずれかです。',
			example: 'node capture.js --browser=chrome'
		},
		{
			name: 'deviceType',
			short: 'dt',
			type: 'string',
			description: 'デバイスタイプを選択します。capture-list.jsonのcaptureTarget値の子階層のパラメータ名を指定します。',
			example: 'node capture.js --deviceType=sp'
		},
		{
			name: 'windowWidth',
			short: 'ww',
			type: 'string',
			description: '起動時のウインドウの幅を指定します。',
			example: 'node capture.js --windowWidth=960'
		},
		{
			name: 'windowHeight',
			short: 'wh',
			type: 'string',
			description: '起動時のウインドウの高さを指定します。',
			example: 'node capture.js --windowHeight=800'
		},
		{
			name: 'basicId',
			short: 'bid',
			type: 'string',
			description: 'Basic認証が必要な場合にID（ユーザー名）を指定します。',
			example: 'node capture.js --basicid=id --basicpadd=pass'
		},
		{
			name: 'basicPass',
			short: 'bpass',
			type: 'string',
			description: 'Basic認証が必要な場合にパスワードを指定します。',
			example: 'node capture.js --basicid=id --basicpadd=pass'
		},
		{
			name: 'rootDir',
			short: 'r',
			type: 'string',
			description: 'capture.jsをseleniumディレクトリ直下以外から実行する場合はseleniumディレクトリのパスを指定します。',
			example: 'node capture.js --rootDir=..'
		}
		]);
	},
	setParameters: function() {
		this.argv = argv.run();
		this.basicAuth = {
			id: this.argv.options.basicId,
			pass: this.argv.options.basicPass
		};
		this.windowSize = {
			width: this.argv.options.windowWidth || -1,
			height: this.argv.options.windowHeight || -1
		};
		this.deviceType = this.argv.options.deviceType || 'pc';
		this.captureList = this.getCaptureList( this.deviceType );
		this.currentBrowser = this.argv.options.browser || BROWSER.FF;
		this.rootDir = this.argv.options.rootDir || '.';
		this.destDir = this.rootDir + '/output/';

		if( !this.driver ) {
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
		}

		var isSetDefaultWindowSizeForSP =
			this.deviceType.toUpperCase() === 'SP'
			&& this.windowSize.width <= 0
			&& this.windowSize.height <= 0;

		if( isSetDefaultWindowSizeForSP ) {
			this.windowSize = {
				width: 320,
				height: 568
			};
		}
	},
	initialConfig: function() {
		var _this = this;

		return new Promise(function(resolve, reject) {
			_this.driver.manage().timeouts().implicitlyWait(5000)
				.then(function() {
					if( _this.windowSize.width > 0 && _this.windowSize.height > 0 ) {
						return _this.driver.manage().window().setSize( parseInt(_this.windowSize.width), parseInt(_this.windowSize.height) );
					}
				})
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
			_this.executeCapture(_this.captureList[index]).then(
				function() {
					if (isLast) {
						_resolve();
					} else {
						_capturePages(++index);
					}
				},
				function() {
					_reject();
				}
			);
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
		var captureList = captureTarget[0][deviceType];
		return captureList;
	},
	getUrlForBasicAuth: function(url, id, pass) {
		url = url.replace('http://', '');
		return `http://${id}:${pass}@${url}/`;
	},
	getImageFileName: function(url) {
		return encodeURIComponent(url) + '.png';
	},
	getDestPath: function(fileName) {
		return `${this.destDir}${this.currentBrowser}/${fileName}`;
	},
	start: function() {
		console.time('Processing Time');
	},
	end: function() {
		this.driver.close();
		this.driver.quit();
		console.log('---- COMPLETE ----');
		console.timeEnd('Processing Time');
	}
};

(function() {
	new WebDriver();
}());