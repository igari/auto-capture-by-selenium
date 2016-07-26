const fs = require('fs');
const gm = require('gm');
const del = require('del');

const Util = require('./util');

const PATH = {
	TEMP_DIR: './.temp/',
	TEMP_FILENAME: 'temp_h{h}_v{v}.png',
	TEMP_HCOMB_FILENAME: 'temp_hcomb_v{v}.png'
};

var Capture = function(driver) {
	this.driver = driver;
	this.imagePathList = [];
};
Capture.prototype = {
	saveFullScreenShot: function(fileName) {
		var _this = this;
		var promise = new Promise(function(resolve, reject) {
			Promise.all([
					_this.driver.executeScript('document.querySelector("body").style.overflow = "hidden";'),
					_this.driver.executeScript('return document.body.scrollHeight'),
					_this.driver.executeScript('return document.body.scrollWidth'),
					_this.driver.executeScript('return window.innerHeight'),
					_this.driver.executeScript('return window.innerWidth')
				])
				.then(function(data) {
					return _this.captureAllPages(fileName, data);
				})
				.then(function() {
					return _this.combineTempImages(fileName);
				})
				.then(function() {
					//最後に残ったtemp画像を削除しておく
					return _this.deleteTempImages();
				})
				.then(function() {
					resolve();
				});
		});
		return promise;
	},
	captureAllPages: function(fileName, data) {
		var _this = this;
		var _resolve;
		var _reject;

		var totalHeight = data[1];
		var totalWidth = data[2];
		var windowHeight = data[3];
		var windowWidth = data[4];
		var horizontalScrollCount = Math.ceil(totalWidth / windowWidth); //ウインドウ幅単位で横スクロールできる回数
		var verticalScrollCount = Math.ceil(totalHeight / windowHeight); //ウインドウ幅単位で縦スクロールできる回数
		var vScrollIndex = 0; //現在の横スクロールインデックス
		var hScrollIndex = 0; //現在の縦スクロールインデックス

		var _captureAllPages = function() {
			var isLastHorizontalScroll = hScrollIndex >= horizontalScrollCount - 1;
			var isLastVerticalScroll = vScrollIndex >= verticalScrollCount - 1;

			_this.saveScreenShotAndScroll(
				PATH.TEMP_DIR + PATH.TEMP_FILENAME.replace('{h}', hScrollIndex).replace('{v}', vScrollIndex),
				totalHeight,
				totalWidth,
				windowHeight,
				windowWidth,
				vScrollIndex,
				hScrollIndex
			).then(function() {
				if (isLastHorizontalScroll && isLastVerticalScroll) {
					_resolve();
					return;
				}

				if (isLastHorizontalScroll) {
					hScrollIndex = 0;
					++vScrollIndex;
				} else {
					++hScrollIndex;
				}
				_captureAllPages();
			});
		};

		return new Promise(function(resolve, reject) {
			_resolve = resolve;
			_reject = reject;

			_this.deleteTempImages().then(function() {
				_captureAllPages();
			});
		});
	},
	saveScreenShotAndScroll: function(
		fileName,
		totalHeight,
		totalWidth,
		windowHeight,
		windowWidth,
		vScrollIndex,
		hScrollIndex
	) {
		var _this = this;
		var promise = new Promise(function(resolve, reject) {
			var scrollHeight = windowHeight * vScrollIndex;
			var scrollWidth = windowWidth * hScrollIndex;

			var extraWidth;
			var extraHeight;
			var isOverScrollOfHorizontal = totalWidth < scrollWidth + windowWidth;
			var isOverScrollOfVertical = totalHeight < scrollHeight + windowHeight;

			if (isOverScrollOfHorizontal) {
				extraWidth = totalWidth - scrollWidth;
			}
			if (isOverScrollOfVertical) {
				extraHeight = totalHeight - scrollHeight;
			}

			_this.driver.executeScript(
				'window.scrollTo(' + scrollWidth + ',' + scrollHeight + ')'
			)
			.then(function() {
				//スクロールが完了していない場合があるためwaitさせる
				return new Promise(function( resolve, reject ) {
					setTimeout(function() { resolve(); }, 100);
				});
			})
			.then(function() {
				return _this.saveScreenShot(fileName);
			})
			.then(function() {
				//横スクロールでmaxスクロール時に余り部分のみを切抜き
				if (extraWidth > 0) {
					return _this.cropImage(fileName, extraWidth, windowHeight, windowWidth - extraWidth, 0);
				}
			})
			.then(function() {
				//縦スクロールでmaxスクロール時に余り部分のみを切抜き
				if (extraHeight > 0) {
					return _this.cropImage(fileName, windowWidth, extraHeight, 0, windowHeight - extraHeight);
				}
			})
			.then(function() {
				resolve();
			});
		});
		return promise;
	},
	saveScreenShot: function(fileName) {
		var _this = this;
		var photoData;

		var promise = new Promise(function(resolve, reject) {
			_this.driver.takeScreenshot()
				.then(function(data) {
					photoData = data;
					return Util.makeDir(fileName);
				})
				.then(function() {
					fs.writeFileSync(fileName, photoData, 'base64');

					_this.imagePathList.push(fileName);
					console.log('SAVE: ' + fileName);
					resolve();
				});
		});
		return promise;
	},
	combineTempImages: function(fileName) {
		var _this = this;

		return new Promise(function(resolve, reject) {
			_this.hashPathList = _this.imagePathList.reduce(function(dictionary, data, index) {
				var hashV = parseInt(data.match(/v[0-9]+/)[0].slice(1));

				if (dictionary[hashV] === undefined) {
					dictionary[hashV] = [];
				}
				dictionary[hashV].push(data);
				return dictionary;
			}, {});

			//画像を行ごとに横連携した後に縦連携して結合を完成させる
			_this.combineHorizontalTempImages()
				.then(function(horizontalCombList) {
					return _this.saveCombineImage(fileName, horizontalCombList, false);
				})
				.then(function() {
					resolve();
				});
		});
	},
	combineHorizontalTempImages: function() {
		var _this = this;
		var horizontalCombList = [];
		var _resolve;
		var _reject;

		var _combineHorizontalTempImages = function(vScrollIndex) {
			var hasNextData = _this.hashPathList[vScrollIndex] !== undefined;
			if (!hasNextData) {
				_resolve(horizontalCombList);
				return;
			}

			var imageList = _this.hashPathList[vScrollIndex];
			var combFileName = PATH.TEMP_DIR + PATH.TEMP_HCOMB_FILENAME.replace('{v}', vScrollIndex);

			_this.saveCombineImage(
				combFileName,
				imageList,
				true
			).then(function() {
				horizontalCombList.push(combFileName);
				_combineHorizontalTempImages(++vScrollIndex);
			});
		};

		return new Promise(function(resolve, reject) {
			_resolve = resolve;
			_reject = reject;
			_combineHorizontalTempImages(0);
		});
	},
	saveCombineImage: function(fileName, imageList, isHorizontalCombine) {
		var _this = this;
		var combineImage;

		return new Promise(function(resolve, reject) {
			for (var image of imageList) {
				if (combineImage === undefined) {
					combineImage = gm(image);
				} else {
					combineImage.append(image, isHorizontalCombine);
				}
			}

			Util.makeDir(fileName)
				.then(function() {
					return _this.writeCombineImage(fileName, combineImage);
				})
				.then(function(err) {
					if (err) throw err;
					resolve();
				});
		});
	},
	writeCombineImage: function(fileName, combineImage) {
		return new Promise(function(resolve, reject) {
			combineImage.write(fileName, function() {
				console.log('COMBINED: ' + fileName);
				resolve();
			});
		});
	},
	cropImage: function(fileName, width, height, x, y) {
		return new Promise(function(resolve, reject) {
			gm(fileName)
				.crop(width, height, x, y)
				.write(fileName, function() {
					console.log(`CLOPED: ${fileName}`);
					resolve();
				});
		});
	},
	deleteTempImages: function() {
		var _this = this;
		return new Promise(function(resolve, reject) {
			del([PATH.TEMP_DIR + '*']).then(function() {
				resolve();
			});
		});
	}
};

module.exports = Capture;