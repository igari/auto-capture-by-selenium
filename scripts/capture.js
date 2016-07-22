var fs = require('fs');
var path = require('path');
var webdriver = require('selenium-webdriver');
var gm = require('gm');
var del = require('del');
var mkdirp = require('mkdirp');

var BROWSER = {
	CHROME: 'chrome',
	FF: 'firefox',
	IE: 'ie'
};

var WebDriver = {
	init: function () {
		this.setParameters();
		this.openPage();
	},
	setParameters: function() {
		this.currentBrowser = process.argv[2] || BROWSER.FF;

		var driver = new webdriver.Builder().usingServer('http://localhost:4444/wd/hub');

		switch( this.currentBrowser ) {
			case BROWSER.CHROME:
				driver.withCapabilities( webdriver.Capabilities.chrome() );
				break;
			case BROWSER.FF:
				driver.withCapabilities( webdriver.Capabilities.firefox() );
				break;
			case BROWSER.IE:
				driver.withCapabilities( webdriver.Capabilities.ie() );
				break;
		}
		this.driver = driver.build();
	},
	openPage: function() {
		var _this = this;
		var captureUrl = this.getDestPath('example.png');
		var capture = new Capture( this.driver );

		this.driver.get('http://google.com/');

		switch( this.currentBrowser ) {
			case BROWSER.CHROME:
				capture.saveFullScreenShot( captureUrl ).then(function () {
					_this.end();
				});
				break;
			case BROWSER.FF:
			case BROWSER.IE:
			default:
				capture.saveScreenShot( captureUrl ).then(function() {
					_this.end();
				});
		}
	},
	getDestPath: function ( fileName ) {
		return './images/' + this.currentBrowser.toString() + '/' + fileName;
	},
	end: function () {
		this.driver.quit();
	}
};

var Util = {
	makeDir: function ( fileName ) {
		var promise = new Promise( function( resolve, reject ) {
			mkdirp( path.dirname( fileName ), function(err) {
				if( err ) throw err;
				resolve();
			});
		});
		return promise;
	}
};

var Capture = function ( driver ) {
	this.driver = driver;
	this.imagePathList = [];
};
Capture.prototype = {
	CONF: {
		TEMP_DIR: './.temp/'
	},
	saveFullScreenShot: function ( fileName ) {
		var _this = this;
		var promise = new Promise( function( resolve, reject ) {
			Promise.all([
				_this.driver.executeScript( 'document.querySelector("body").style.overflow = "hidden";' ),
				_this.driver.executeScript( 'return document.body.scrollHeight' ),
				_this.driver.executeScript( 'return document.body.scrollWidth' ),
				_this.driver.executeScript( 'return window.innerHeight' ),
				_this.driver.executeScript( 'return window.innerWidth' )
			])
			.then( function( data ) {
				return _this.captureAllPages( fileName, data );
			})
			.then( function() {
				resolve();
			});
		});
		return promise;
	},
	captureAllPages: function ( fileName, data ) {
		var _this = this;
		var promise = new Promise(function ( resolve, reject ) {
			var totalHeight = data[1];
			var totalWidth = data[2];
			var windowHeight = data[3];
			var windowWidth = data[4];
			var horizontalScrollCount = Math.ceil( totalWidth / windowWidth ); //ウインドウ幅単位で横スクロールできる回数
			var verticalScrollCount = Math.ceil( totalHeight / windowHeight );//ウインドウ幅単位で縦スクロールできる回数
			var vScrollIndex = 0; //現在の横スクロールインデックス
			var hScrollIndex = 0; //現在の縦スクロールインデックス

			var loopScreenShot = function () {
				var isLastHorizontalScroll = hScrollIndex >= horizontalScrollCount - 1;
				var isLastVerticalScroll = vScrollIndex >= verticalScrollCount - 1;

				_this.saveScreenShotAndScroll(
					`${_this.CONF.TEMP_DIR}temp_h${hScrollIndex}_v${vScrollIndex}.png`,
					windowHeight,
					windowWidth,
					vScrollIndex,
					hScrollIndex
				).then( function () {
					if( isLastHorizontalScroll && isLastVerticalScroll ) {
						_this.combineTempImages( fileName );
						resolve();
						return;
					}

					if( isLastHorizontalScroll ) {
						hScrollIndex = 0;
						++vScrollIndex;
					}else {
						++hScrollIndex;
					}
					loopScreenShot();
				});
			};

			_this.deleteTempImages().then(function () {
				loopScreenShot();
			});
		});
		return promise;
	},
	combineTempImages: function ( fileName ) {
		var _this = this;
		var combineImage;

		for( var i = 0,len = this.imagePathList.length; i < len; i++ ) {
			var imagePath = this.imagePathList[i];

			if( i === 0 ) {
				combineImage = gm( imagePath );
			}else {
				combineImage.append( imagePath );
			}
		}

		Util.makeDir( fileName )
			.then(function () {
				return new Promise( function( resolve, reject ) {
					combineImage.write( fileName, function () {
						resolve();
					});
				});
			})
			.then( function() {
				return _this.deleteTempImages();
			})
			.then( function (err) {
				if(err) throw err;
				console.log( 'COMBINE: ' + fileName );
			});
	},
	deleteTempImages: function () {
		var _this = this;
		return new Promise( function( resolve, reject ) {
			del([ _this.CONF.TEMP_DIR + '*' ]).then(function () {
				resolve();
			});
		});
	},
	saveScreenShotAndScroll: function ( fileName, windowHeight, windowWidth, vScrollIndex, hScrollIndex ) {
		var _this = this;
		var promise = new Promise(function ( resolve, reject ) {
			var scrollHeight = windowHeight * vScrollIndex;
			var scrollWidth = windowWidth * hScrollIndex;

			_this.driver.executeScript(
				'window.scrollTo(' + scrollWidth + ',' + scrollHeight + ')'
			).then(function () {
				return _this.saveScreenShot( fileName );
			}).then(function () {
				resolve();
			});
		});
		return promise;
	},
	saveScreenShot: function( fileName ) {
		var _this = this;
		var photoData;

		var promise = new Promise(function ( resolve, reject ) {
			_this.driver.takeScreenshot()
				.then( function( data ) {
					photoData = data;
					return Util.makeDir( fileName );
				})
				.then( function() {
					fs.writeFileSync( fileName, photoData, 'base64' );

					_this.imagePathList.push( fileName );
					console.log('SAVE: ' + fileName );
					resolve();
				});
		});
		return promise;
	}
};

WebDriver.init();