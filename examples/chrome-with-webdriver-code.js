const Capium = require('./../lib/capium.js');

const capium = new Capium({
	pages: {
		url: "http://www.google.com/ncr",
		wd: function (driver, webdriver) {
			driver.findElement(webdriver.By.name('q')).sendKeys('webdriver');
			driver.findElement(webdriver.By.name('btnG')).click();
			driver.wait(webdriver.until.titleIs('webdriver - Google Search'), 5000);
		}
	},
	caps: {
		"browserName": "chrome",
		"width": 1280,
		loggingPrefs: {
			'browser':		'ALL',
			'driver':		'ALL',
			'server':		'ALL',
			'performance':	'ALL',
			'client':		'ALL'
		},
		chromeOptions: {
			perfLoggingPrefs: {
				traceCategories: 'v8,blink.console,disabled-by-default-devtools.timeline'
			},
		}
	}
});

module.exports = capium.run();

