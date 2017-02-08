"use strict";
var webdriver = require('selenium-webdriver');
const childProcess = require('child_process');

// Input capabilities
var capabilities = {
	'browserName' : 'safari',
	// "browser_version" : "10.0",
	// "os" : "OS X",
	// "os_version" : "Sierra",
	// 'browserstack.user' : 'igaritakeharu',
	// 'browserstack.key' : 'Pstqpsi3yZwrywUiBrmm',
	// "browserstack.local": true
}

var driver = new webdriver.Builder().
// usingServer('http://hub-cloud.browserstack.com/wd/hub').
withCapabilities(capabilities).
build();

driver.manage().timeouts().implicitlyWait(60/*m*/*60/*s*/*1000/*ms*/);
driver.manage().timeouts().setScriptTimeout(60/*m*/*60/*s*/*1000/*ms*/);
driver.manage().timeouts().pageLoadTimeout(60/*m*/*60/*s*/*1000/*ms*/);

driver.get('http://localhost/ccc/');
// driver.wait(driver.executeScript('return document.readyState === "complete"'), 60*60*1000, 'could not');
// driver.executeAsyncScript('setTimeout(arguments[arguments.length-1].bind(null, "a"), 5000);').then(function (data) {
// 	console.log(data);
// });
driver.executeAsyncScript('TSUTAYA_MOVIE.COMMON.pageshow.then(arguments[arguments.length-1].bind(null, TSUTAYA_MOVIE.COMMON.exe.toString()));').then(function (data) {
	console.log(data);
});
// driver.executeScript('return TSUTAYA_MOVIE.COMMON.exe.toString();').then(function (data) {
// 	console.log(data);
// });


driver.getTitle().then(function(title) {
	console.log(title);
});

driver.quit();