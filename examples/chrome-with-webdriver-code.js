const capium = require('./../lib/capium.js');

capium({
	pages: [
		{
			url: "http://www.google.com/ncr",
			wd: function (driver, webdriver) {
				driver.findElement(webdriver.By.name('q')).sendKeys('webdriver');
				driver.findElement(webdriver.By.name('btnG')).click();
				driver.wait(webdriver.until.titleIs('webdriver - Google Search'), 1000);
			}
		}
	],
	caps: {
		"browserName": "chrome"
	}
});

