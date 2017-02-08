"use strict";

const fs = require('fs');
const gm = require('gm');
const del = require('del');

const util = require('./util.js');

const PATH = {
	TEMP_DIR: './.temp/',
	TEMP_FILENAME: 'temp_h{h}_v{v}.png',
	TEMP_HCOMB_FILENAME: 'temp_hcomb_v{v}.png'
};

const Capture = function(Capium) {
	this.driver = Capium.driver;
	this.imagePathList = [];
	this.func2str = Capium.func2str;
	this.executeScript = Capium.executeScript;
};

Capture.prototype = {

	saveScreenShot: function(fileName) {
		return this.driver.takeScreenshot()
			.then(function(photoData) {
				return util.makeDir(fileName).then(function () {
					fs.writeFileSync(fileName, photoData, 'base64');
					this.imagePathList.push(fileName);
					console.log('\tSAVE: ' + fileName);
					return fileName;
				}.bind(this));
			}.bind(this));
	},
	saveFullScreenShot: function(fileName) {

		return this.executeScript(function () {return window.devicePixelRatio;})
			.then(function (devicePixelRatio) {
				this.devicePixelRatio = +devicePixelRatio;
			}.bind(this))
			.then(this.deleteTempImages.bind(this))
			.then(function(data) {
				return this.captureFullPage(fileName, data);
			}.bind(this))
			.then(this.combineTempImages.bind(this, fileName))
			.then(this.deleteTempImages.bind(this))
			.then(function() { return fileName; });
	},
	captureFullPage: function() {

		return new Promise(function(resolve) {

			let verticalScrollIndex = 0;
			let horizontalScrollIndex = 0;

			let capturePage = function () {

				this.executeScript(this.fixed2absolute_in_browser)
					.then(function () {
						return Promise.all([
						this.executeScript(function(){return document.body.scrollHeight;}),
						this.executeScript(function(){return document.body.scrollWidth;}),
						this.executeScript(function(){return window.innerHeight;}),
						this.executeScript(function(){return window.innerWidth;}),
						this.executeScript(function(){return screen.height;}),
						this.executeScript(function(){return screen.availHeight;}),
						]);
					}.bind(this))
					.then(function (data) {

						let scrollHeight = data[0];
						let scrollWidth = data[1];
						let windowHeight = data[2];
						let windowWidth = data[3];
						let screenHeight = data[4];
						let availHeight = data[5];

						console.log('scrollWidth', scrollWidth)
						console.log('windowWidth', windowWidth)
						console.log('scrollHeight', scrollHeight)
						console.log('windowHeight', windowHeight)
						console.log('screenHeight', screenHeight)
						console.log('availHeight', availHeight)

						let horizontalScrollMaxCount = Math.ceil(scrollWidth / windowWidth);
						let verticalScrollMaxCount = Math.ceil(scrollHeight / windowHeight);

						let isLastHorizontalScroll = horizontalScrollIndex === horizontalScrollMaxCount - 1;
						let isLastVerticalScroll = verticalScrollIndex === verticalScrollMaxCount - 1;

						let pathName = PATH.TEMP_DIR + PATH.TEMP_FILENAME.replace('{h}', horizontalScrollIndex + '').replace('{v}', verticalScrollIndex + '');

						this.saveScreenShotAndScroll(pathName, scrollHeight, scrollWidth, windowHeight, windowWidth, verticalScrollIndex, horizontalScrollIndex)
							.then(function () {
								if (isLastHorizontalScroll && isLastVerticalScroll) {
									resolve();
								} else {
									if (isLastHorizontalScroll) {
										horizontalScrollIndex = 0;
										verticalScrollIndex++;
									} else {
										horizontalScrollIndex++;
									}
									capturePage();
								}
							}.bind(this));
					}.bind(this));
			}.bind(this);

			capturePage();

		}.bind(this));
	},
	saveScreenShotAndScroll: function(fileName, scrollHeight, scrollWidth, windowHeight, windowWidth, verticalScrollIndex, horizontalScrollIndex) {

		var currentScrollPosY = windowHeight * verticalScrollIndex;
		var currentScrollPosX = windowWidth * horizontalScrollIndex;
		var currentCapturedWidth = currentScrollPosX + windowWidth;
		var currentCapturedHeight = currentScrollPosY + windowHeight;

		var extraWidth;
		var extraHeight;

		var isOverScrollOfHorizontal = scrollWidth < currentCapturedWidth;
		var isOverScrollOfVertical = scrollHeight < currentCapturedHeight;

		if (isOverScrollOfHorizontal) {
			extraWidth = scrollWidth - currentScrollPosX;
		}

		if (isOverScrollOfVertical) {
			extraHeight = scrollHeight - currentScrollPosY;
		}

		return this.driver.executeScript('window.scrollTo(' + currentScrollPosX + ',' + currentScrollPosY + ')')
			.then(this.driver.sleep.bind(this.driver, 1000))
			.then(function () {
				return this.executeScript(function () {return window.scrollY;})
					.then(function (scrollY) {
						console.log('scrollY', scrollY);
					});
			}.bind(this))
			.then(this.executeScript.bind(this, this.fixed2absolute_in_browser))
			.then(this.saveScreenShot.bind(this, fileName))
			.then(function() {
				if (extraWidth > 0) {
					return this.cropImage(fileName, extraWidth, windowHeight, windowWidth - extraWidth, 0);
				}
			}.bind(this))
			.then(function() {
				if (extraHeight > 0) {
					return this.cropImage(fileName, windowWidth, extraHeight, 0, windowHeight - extraHeight);
				}
			}.bind(this));
	},
	combineTempImages: function(fileName) {

		return this.generateHashPathList()
			.then(this.combineHorizontalTempImages.bind(this))
			.then(this.combineVerticalTempImages.bind(this))
			.then(function (combineImage) {
				return this.saveCombineImage(fileName, combineImage)
			}.bind(this));
	},
	generateHashPathList: function () {
		let hashPathList = this.imagePathList.reduce(function(previousValue, currentValue, index) {
			var hashV = parseInt(currentValue.match(/v[0-9]+/)[0].slice(1));
			if (previousValue[hashV] === undefined) {
				previousValue[hashV] = [];
			}
			previousValue[hashV].push(currentValue);
			return previousValue;
		}, {});
		return Promise.resolve(hashPathList);
	},
	combineVerticalTempImages: function (horizontalCombList) {
		return this.appendTempImages(horizontalCombList, false);
	},
	combineHorizontalTempImages: function(hashPathList) {

		return new Promise(function(resolve) {

			let horizontalCombList = [];
			let combineHorizontalTempImage = function(vScrollIndex) {

				let hasNextData = hashPathList[vScrollIndex] !== undefined;
				if (!hasNextData) {
					resolve(horizontalCombList);
					return;
				}

				let imageList = hashPathList[vScrollIndex];
				let templateFileName = PATH.TEMP_DIR + PATH.TEMP_HCOMB_FILENAME.replace('{v}', vScrollIndex);

				this.appendTempImages(imageList, true)
					.then(function (combineImage) {
						return this.saveCombineImage(templateFileName, combineImage);
					}.bind(this))
					.then(function() {
						horizontalCombList.push(templateFileName);
						combineHorizontalTempImage(++vScrollIndex);
					});

			}.bind(this);

			combineHorizontalTempImage(0);

		}.bind(this));
	},
	appendTempImages: function (imageList, isHorizontalCombine) {
		let combineImage = null;
		for (let image of imageList) {
			if (combineImage === null) {
				combineImage = gm(image);
			} else {
				combineImage.append(image, isHorizontalCombine);
			}
		}
		return Promise.resolve(combineImage);
	},
	saveCombineImage: function(fileName, combineImage) {

		if(!combineImage) {
			return Promise.resolve();
		}

		return util.makeDir(fileName)
			.then(function () {
				return this.writeCombineImage(fileName, combineImage);
			}.bind(this))
			.catch(function(err) {
				if (err) throw err;
			}.bind(this));
	},
	writeCombineImage: function(fileName, combineImage) {
		return new Promise(function(resolve, reject) {
			try {
				combineImage.write(fileName, function () {
					console.log('\tCOMBINED: ' + fileName);
					resolve();
				});
			} catch(e) {
				reject(e)
			}
		});
	},
	cropImage: function(fileName, width, height, x, y) {
		width = width * this.devicePixelRatio;
		height = height * this.devicePixelRatio;
		x = x * this.devicePixelRatio;
		y = y * this.devicePixelRatio;

		return new Promise(function(resolve, reject) {
			try {
				gm(fileName)
					.crop(width, height, x, y)
					.write(fileName, function() {
						console.log(`\tCLOPPED: ${fileName}`);
						resolve();
					});
			} catch(e) {
				reject(e);
			}
		});
	},
	deleteTempImages: function() {
		return new Promise(function(resolve, reject) {
			del([PATH.TEMP_DIR + '*']).then(function() {
				resolve();
			});
		});
	},

	fixed2absolute_in_browser: function() {

		var allElements = document.querySelectorAll("*");

		var style = document.querySelector('#capium-style-element');
		if(!style) {
			style = document.createElement('style');
			style.id = 'capium-style-element';
			var head = document.querySelector('head');
			head.appendChild(style);
		}

		var sheet = style.sheet;

		for (var i = 0, len = allElements.length; i < len; i++) {
			var element = allElements[i];
			var position = getComputedStyle(element).position;
			if (position === 'fixed') {
				element.style.setProperty('position', 'absolute', 'important');
			}
			var positionBefore = getComputedStyle(element, '::before').position;
			var positionAfter = getComputedStyle(element, '::after').position;
			var className = element.className ? '.' + Array.prototype.join.call(element.classList, '.') : '';
			var idName = '#' + element.id;
			var tagName = element.tagName.toLowerCase();
			if (positionBefore === 'fixed') {
				sheet.insertRule(tagName + idName + className + '::before {position:absolute !important;}', sheet.cssRules.length - 1);
			}
			if (positionAfter === 'fixed') {
				sheet.insertRule(tagName + idName + className + '::after {position:absolute !important;}', sheet.cssRules.length - 1);
			}
		}
	},
};

module.exports = Capture;