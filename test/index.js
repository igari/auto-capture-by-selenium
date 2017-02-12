describe('test', function () {
	this.timeout(60*60*1000);
	[
		// 'chrome.js',
		'chrome-with-webdriver-code.js',
		// 'edge.js',
		'firefox.js',
		// 'ie11.js',
		'safari.js'
	].forEach(function (exampleFileName) {
		it(exampleFileName, function () {
			return require('../examples/' + exampleFileName);
		})
	});
})
