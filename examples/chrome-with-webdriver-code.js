const Capium = require('./../lib/capium.js');

const capium = new Capium({
	pages: {
		url: "http://www.google.com/ncr",
		wd: function (driver, webdriver) {
			driver.findElement(webdriver.By.name('q')).sendKeys('webdriver');
			driver.findElement(webdriver.By.name('btnG')).click();
			driver.wait(webdriver.until.titleIs('webdriver - Google Search'), 1000);
		}
	},
	caps: {
		"_browserName": "chrome",
		"width": 1280
	}
});

module.exports = capium.run();

