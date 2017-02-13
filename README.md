# Capium

A tool to get screenshots of web pages so easily and automatically works with Selenium3.0 for NodeJS and also be able to use BrowserStack and SauceLabs.

## Installation

### Install to your project
```sh
yarn add capium
```
or
```sh
npm i capium --save-dev
```

### Install `graphic magick` (if you don't have)
#### Mac OS X with [Homebrew](http://mxcl.github.io/homebrew/)
```bash
brew install graphicsmagick
```
#### Windows
Download and Install from [http://www.graphicsmagick.org/download.html](http://www.graphicsmagick.org/download.html)

## Basic Usage (Only get screenshots)

`pages and caps` are able to be specified multiply with Array.
If single, it does'nt need to specify as Array.

index.js
```js
const Capium = require('capium');
const capium = new Capium({
  pages: [
    "http://localhost/login.html",
    "http://localhost/register.html",
  ],
  caps: [
    {"browserName": "chrome"},
    {"browserName": "firefox"}
  ]
});
capium.run();
```

just run the file as node
```sh
node index.js
```
If finished the process, Then you can see screenshots(png) in the `${you project root}/output` directory.

## Advanced Usage (With Webdriver Code)

Not only getting screenshots, `WebDriver Code` is also available.
To run `WebDriver Code` on the page, set `wd` property as function. 

```js
const Capium = require('capium');
const capium = new Capium({
  pages: [
    {
      url: "http://www.google.com/ncr",
      
      //Write here to execute webdriver api (Plain Webdriver Syntax)
      //This will executed before getting screenshot.
      wd: function (driver, webdriver) {
        driver.findElement(webdriver.By.name('q')).sendKeys('webdriver');
        driver.findElement(webdriver.By.name('btnG')).click();
        driver.wait(webdriver.until.titleIs('webdriver - Google Search'), 1000);
      }
    }
  ],
  caps: [
    {"browserName": "chrome"},
    {"browserName": "firefox"}
  ]
});
capium.run();
```

## Config

### `pages` => Pages Settings

- `url` is target url to transition
- `wd`(webdriver) is function to execute WebDriver API when page of `url` is loaded.
- A parameter `driver` is `built browser instance` for API e.g. `driver.wait` and `driver.executeScript` etc.
- A parameter `webdriver` is from `require('selenium-webdriver')` for API e.g. `webdriver.By` and `webdriver.until`.

### `caps` => Browsers Capabilities

- Native `browserName` could be specified as chrome/firefox/safari/MicrosoftEdge/internet explorer
- Available as same as native capability of Selenium Webdriver. (See [native capabilities of WebDriver](https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities))

### To run on Remote Selenium(with BrowserStack and SauceLabs)

#### Set account capabilities
- [Account capabilities of BrowserStack for Remote Testing](https://github.com/igari/capium#use-browserstack-for-remote-testing).
- [Account capabilities of SauceLabs for Remote Testing](https://github.com/igari/capium#use-saucelabs-for-remote-testinghttps://github.com/igari/capium#use-browserstack-for-remote-testing).

#### Set browser capabilities

**To specify easily, use `Capability Generator` published by BrowserStack and SauceLabs.**

- [BrowserStack's Generator](https://www.browserstack.com/automate/node#setting-os-and-browser)
- [SauceLabs's Generator](https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/)

**To see all of capability, go to the each service site.**
- [BrowserStack's Capabilities](https://www.browserstack.com/automate/capabilities)
- [SauceLabs's Capabilities](https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options)

#### Examples (safari on iOS on iPhone6)

##### BrowserStack Capabilities

```js
const Capium = require('capium');
const capium = new Capium({
	pages: [
    "http://localhost/login.html",
    "http://localhost/register.html",
  ],
  caps: [
    {
      "browserName": "iPhone",
      "platform": "MAC",
      "device": "iPhone 6",
      "browserstack.user": "****************",
      "browserstack.key": "********************"
    }
  ]
});
capium.run();
```

##### SauceLabs Capabilities
```js
const Capium = require('capium');
const capium = new Capium({
	pages: [
    "http://localhost/login.html",
    "http://localhost/register.html",
  ],
  caps: [
    {
      "browserName": "Safari",
      "appiumVersion": "1.5.3",
      "deviceName": "iPhone 6s Device",
      "deviceOrientation": "portrait",
      "platformVersion": "9.3",
      "platformName": "iOS",
      "username": "***********",
      "accessKey": "********************************"
    }
  ]
});
capium.run();
```

## Some better API than native Webdriver API

### `driver.executeScript` and `driver.executeAsyncScript` are too unreadable and too difficult to write
because they are should to be passed as string like below.

```js
const capium = new Capium({
  pages: [
    {
      url: "http://www.google.com/ncr",
      wd: function (driver, webdriver) {
        driver.executeScript('var allElements = document.querySelector("*"); for(var i = 0, len = allElements.length; i < len; i++) { allElements[i].hidden = true; } return "any value to want to pass";')
      }
    }
  ]
});
```

#### `this.executeScript`

```js
const capium = new Capium({
  pages: [
    {
      url: "http://www.google.com/ncr",
      wd: function (driver, webdriver) {
        this.executeScript(function(arg1, arg2, arg3, arg4, arg5) {
          var allElements = document.querySelector("*");
          for(var i = 0, len = allElements.length; i < len; i++) {
            allElements[i].hidden = true;
          }
          return 'any value to want to pass';
        });
      }
    }
  ]
});
```

#### `this.executeAsyncScript`

```js
const capium = new Capium({
  pages: [
    {
      url: "http://www.google.com/ncr",
      wd: function (driver, webdriver) {
        this.executeAsyncScript(function() {
          var callback = arguments[arguments.length = 1];
          setTimeout(function() {
            callback('any value to want to pass')
          }, 10000);
        });
      }
    }
  ]
});
```

#### Passing arguments

Here is how to pass arguments from process of NodeJS into JavaScript in the Browser.

```js
const capium = new Capium({
  pages: [
    {
      url: "http://www.google.com/ncr",
      wd: function (driver, webdriver) {
        this.executeScript(function(Arguments, are, available, at, here) {
          
          var msg = [Arguments, are, available, at, here].join(' ');
          console.log(msg);//Arguments are available at here
          
          return 'any value to want to pass';
        }, 'Arguments', 'are', 'available', 'at', 'here');
      }
    }
  ]
});
```

And also `executeAsyncScript` is same usage as above `executeScript`.

## Browser Supports

|              | chrome | firefox | edge | ie11 | safari | iphone safari | android chrome |
| ------------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| Mac (local)         | &check; |        |        |        | &check; |        |        |
| Windows (local)     | &check; | &check; | &check; | &check; |        |        |        |
| Browser Stack (remote)| &check; | &check;  | &check; | &check;| &check; | &check; | &check; |
| Sauce Labs (remote)  | &check;| &check;| &check; | &check;| &check; | &triangle; | &triangle; |


## Range of Screenshot

| chrome | firefox | edge | ie11 | safari | ios safari | android chrome |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| Full Page &lowast;1 | Full Page &lowast;1 | Full Page | Full Page &lowast;1 | Full Page &lowast;2  | Full Page &lowast;1 | Above the Fold |

- &lowast;1. As native, above the fold but it's emulated with window scrolling.  
- &lowast;2. In case of Safari10~ & Selenium3~. Otherwise Above the fold

### Run as Standalone

See [a document](https://github.com/igari/capium/blob/master/RUN_AS_STANDALONE.md).

## TIPS

### If you get an error of missing driver
1. Get driver from http://www.seleniumhq.org/download/
2. Enable the binary to be run from anywhere

### If you use safari, turn on `Allow Remote Automation` before running.
Safari > Develop > Allow Remote Automation.

### Specifying Basic Authentication Username and Password
Include Username and Password into the URL.

```js
module.exports = [
  {
    url: "http://username:password@example.com"
  }
];
```

!!!! Take care to not make published the secret information. !!!!

### Local site with Remote Selenium Services (e.g. http://localhost)

#### BrowserStack

Just add `"browserstack.local": "true"`

```json
{
  "browserName": "iPhone",
  "platform": "MAC",
  "device": "iPhone 6",
  "browserstack.user": "****************",
  "browserstack.key": "********************",
  "browserstack.local": "true"
}
```

More information is [here](https://www.browserstack.com/local-testing)

#### SauceLabs

Download & use [Sauce Connect](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy) from Sauce Labs.

##### Basic Usage
It works after launching `SauceConnect` server.
```bash
./sc-4.3.6-osx/bin/sc- u ${username} -k ${accesskey}
```

##### In the case of Basic Authenticated URL:
```bash
./sc-4.3.6-osx/bin/sc -u ${saucelabs_username} -k ${saucelabs_accesskey} -a ${host}:${port}:${basicauth_username}:${basicauth_password}
```

`-a` options is possible to be specified multiple time.

More information is [here](https://wiki.saucelabs.com/pages/viewpage.action?pageId=48365781)


##### Experimental capability to run without running above command

Otherwise, you are able to use  `Sauce Connect` as just add only `"sauceConnect": true` parameter.

```json
{
  "browserName": "chrome",
  "os": "windows",
  "username": "xxxxxxxxxxx",
  "accessKey": "xxxxxxxxxxxxx",
  "sauceConnect": true
}
```

## Testing
```sh
npm test
```

## Changed log

###### v0.6.0
- Possible to get screenshot of web pages as just write only a little config.
- Not only screenshot, and also you can start to Selenium so easily as just write as just install this module.
- Writable selenium code as just write `wd` property as function by page.
- By default, chrome and firefox and safari is runnable as it is. their drivers will be installed automatically.(safari10's driver is already installed natively.)
- Support for full screenshot except for android.
- SauceLabs and BrowserStack can be used with easy config.
- Local testing is also available with above remote testing services(e.g. localhost site.)
- Writable more flexible config. 

###### v0.7.0
- Set color console message
- Possible to get full screenshot even if the page has contents loaded when scrolled.
- Possible to use BrowserStackLocal as just set `browserstack.local: 'true'`
- Add mocha as test framework.
- Possible to test with command `npm test`.
- Possible to install from `yarn`.

## Roadmap

###### v0.8.0
- Runnable on windows OS also correctly.
- Detectable error more finely.

###### v0.9.0
- Save screenshot by version or revision number

###### v1.0.0
- Generate screenshot's diff image between a version and a version

###### v1.1.0 
- Connect to local Appium server
- Run on Real Devices on BrowserStack

## Dependencies
- [Node.js](https://nodejs.org/) v6.4.0~
- [JRE](https://java.com/ja/download/) 1.8~
- [Selenium Webdriver for NodeJS](https://www.npmjs.com/package/selenium-webdriver)
- [Selenium Standalone](https://www.npmjs.com/package/selenium-standalone)
- [Graphics Magick](http://www.graphicsmagick.org)


## Remote Selenium Services used by Capium.

They are awesome cloud testing services using real browsers and devices.

<a href="https://www.browserstack.com/"><img src="https://style-validator.io/img/browserstack-logo.svg" width="350" style="vertical-align: middle;"></a><br>
<br>
<a href="https://saucelabs.com/"><img src="https://saucelabs.com/content/images/logo@2x.png" width="350" style="vertical-align: middle;"></a><br>
