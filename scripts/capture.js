"use strict";

const fs = require('fs');
const gm = require('gm');
const del = require('del');

const Util = require('./util');

const PATH = {
	TEMP_DIR: './.temp/',
	TEMP_FILENAME: 'temp_h{h}_v{v}.png',
	TEMP_HCOMB_FILENAME: 'temp_hcomb_v{v}.png'
};

const Capture = function(driver) {
	this.driver = driver;
	this.imagePathList = [];
};

Capture.prototype = {
	saveScreenShot: function(fileName) {
		return this.driver.takeScreenshot()
			.then(function(photoData) {
				Util.makeDir(fileName).then(function () {
					fs.writeFileSync(fileName, photoData, 'base64');
					this.imagePathList.push(fileName);
					// console.log('\tSAVE: ' + fileName);
					return fileName;
				}.bind(this));
			}.bind(this));
	},
	saveFullScreenShot: function(fileName) {
		return this.driver.executeScript(
				'document.querySelector("body").style.overflow = "hidden";' +
				// 'document.querySelector(".l-header-wrapper-nonav").style.position = "absolute";' +
				'return window.devicePixelRatio;'
			)
			.then(function (devicePixelRatio) {
				this.devicePixelRatio = +devicePixelRatio;
			}.bind(this))
			.then(this.deleteTempImages.bind(this))
			.then(function(data) {
				return this.captureFullPage(fileName, data);
			}.bind(this))
			.then(this.combineTempImages.bind(this, fileName))
			// .then(function () {
			// 	console.log(this.scrollWidth,this.scrollHeight)
			// 	return new Promise(function (resolve) {
			// 		gm(fileName).scale(1200, 1200).write(fileName, resolve);
			// 	});
			// })
			// .then(this.deleteTempImages.bind(this))
			.then(function() { return fileName; });
	},
	captureFullPage: function() {

		return new Promise(function(resolve) {

			let verticalScrollIndex = 0;
			let horizontalScrollIndex = 0;

			let capturePage = function () {

				Promise.all([
						this.driver.executeScript('return document.body.scrollHeight'),
						this.driver.executeScript('return document.body.scrollWidth'),
						this.driver.executeScript('return window.innerHeight'),
						this.driver.executeScript('return window.innerWidth')
					])
					.then(function (data) {

						let scrollHeight = data[0];
						let scrollWidth = data[1];
						let windowHeight = data[2];
						let windowWidth = data[3];

						let horizontalScrollMaxCount = Math.ceil(scrollWidth / windowWidth);
						let verticalScrollMaxCount = Math.ceil(scrollHeight / windowHeight);

						let isLastHorizontalScroll = horizontalScrollIndex === horizontalScrollMaxCount - 1;
						let isLastVerticalScroll = verticalScrollIndex === verticalScrollMaxCount - 1;

						let pathName = PATH.TEMP_DIR + PATH.TEMP_FILENAME.replace('{h}', horizontalScrollIndex+'').replace('{v}', verticalScrollIndex+'');

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
							});
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
			.then(this.driver.sleep.bind(this.driver, 500))
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

		this.hashPathList = this.imagePathList.reduce(function(dictionary, data, index) {
			var hashV = parseInt(data.match(/v[0-9]+/)[0].slice(1));

			if (dictionary[hashV] === undefined) {
				dictionary[hashV] = [];
			}
			dictionary[hashV].push(data);
			return dictionary;
		}, {});

		return this.combineHorizontalTempImages()
			.then(this.combineVerticalTempImages.bind(this))
			.then(function (combineImage) {
				return this.saveCombineImage(fileName, combineImage)
			}.bind(this));
	},
	combineVerticalTempImages: function (horizontalCombList) {
		return this.appendTempImages(horizontalCombList, false);
	},
	combineHorizontalTempImages: function() {

		return new Promise(function(resolve) {

			let horizontalCombList = [];

			let combineHorizontalTempImage = function(vScrollIndex) {

				let hasNextData = this.hashPathList[vScrollIndex] !== undefined;

				if (!hasNextData) {
					resolve(horizontalCombList);
					return;
				}

				let imageList = this.hashPathList[vScrollIndex];
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

		return Util.makeDir(fileName)
			.then(function() {
				return this.writeCombineImage(fileName, combineImage);
			}.bind(this))
			.catch(function(err) {
				if (err) throw err;
			});
	},
	writeCombineImage: function(fileName, combineImage) {
		return new Promise(function(resolve, reject) {
			try {
				combineImage.write(fileName, function() {
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
				console.log(width, height, x, y);
				gm(fileName)
					.crop(width, height, x, y)
					.write(fileName, function() {
						console.log(`\tCLOPED: ${fileName}`);
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
	}
};

module.exports = Capture;