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
```bash
brew install graphicsmagick
```

## Basic Usage
`pages and capabilities` are able to be specified multiply with Array.
If single, it does'nt need to specify as Array.

index.js
```js
const Capium = require('capium');
const capium = new Capium({
  pages: [
    "https://www.google.com/",
    "https://www.mozilla.org/",
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

## Advanced Usage

`Remote Testing` and `WebDriver Code` is also available.
If you want to write `WebDriver Code`, make pages property value an object, and set `url` and `wd` key. 

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
    {
      "browserName": "safari",
      "os": "ios",
      'browserstack.user': 'xxxxxxxxxxxxxx',//Add user for Browser Stack
      'browserstack.key' : 'xxxxxxxxxxxxxx'//Add key for Browser Stack
    },
    {
      "browserName": "safari",
      "os": "ios",
      'username': 'xxxxxxxxxxxxxx',//Add user for Sauce Labs
      'accessKey' : 'xxxxxxxxxxxxxx'//Add key for Suace Labs
    }
  ]
});
capium.run();
```

More information about Remote Testing Services is...

- [Use BrowserStack for Remote Testing](https://github.com/igari/capium#use-browserstack-for-remote-testing).
- [Use SauceLabs for Remote Testing](https://github.com/igari/capium#use-saucelabs-for-remote-testinghttps://github.com/igari/capium#use-browserstack-for-remote-testing).


## Setup

### Pages Settings

- `url` is target url to transition
- `wd`(webdriver) is function to execute WebDriver API when page of `url` is loaded.
- A parameter `driver` is `built browser instance`.
- A parameter `webdriver` is `require('selenium-webdriver')`.

### Browsers Capabilities

- `browserName` and `os` is original properties for Capium (Refer below table to specify)
- Other properties is available as capabilities for `Webdriver` and `BrowserStack` and `SauceLabs`

See more key of [os and browserName](https://github.com/igari/capium/tree/master#os-and-browser)

See [all capabilities of WebDriver](https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities)

*Capabilities you specified takes precedence over below Default Capabilities*

#### Default Capabilities in Capium
- [Default Capabilities for Local](https://github.com/igari/capium/blob/master/scripts/caps-local.js)
- [Default Capabilities for BrowserStack](https://github.com/igari/capium/blob/master/scripts/caps-browserstack.js)
- [Default Capabilities for SauceLabs](https://github.com/igari/capium/blob/master/scripts/caps-saucelabs.js)


#### `os` and `browserName`

|              | chrome | firefox | safari | edge | ie11 |
| ------------ | ------ | ------ | ------ | ------ | ------ |
| windows      | &check; | &check; |      | &check;| &check; |
| mac          | &check; | &check; | &check; |      |       |
| android*1      | &check; |       |        |        |       |
| ios*1          | &check; |       | &check; |       |        |
| android_emulator | &check; |       |        |        |       |
| ios_emulator | &check; |       | &check; |       |        |

*1 Only supported in the case of Using BrowserStack

### Destination Directory

If you run it, Then you can see screenshots(png) in the `${you project root}/output` directory.


## Some better API than native Webdriver API

### `driver.executeScript and `driver.executeAsyncScript` are so complicated and unreadable
because they are should to be passed as string.

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

#### Use `this.executeScript` and `this.executeAsyncScript`

##### `this.executeScript`

```js
const capium = new Capium({
  pages: [
    {
      url: "http://www.google.com/ncr",
      wd: function (driver, webdriver) {
        this.executeScript(function() {
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

##### `this.executeAsyncScript`

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

## Browser Supports

|              | chrome | firefox | edge | ie11 | safari | iphone safari | android chrome |
| ------------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| Browser Stack (remote)| &check; | &check;  | &check; | &check;| &check; | &check; | &check; |
| Sauce Labs (remote)  | &check;| &check;| &check; | &check;| &check; | &triangle; | &triangle; |
| Windows (local)     | &check; | &check; | &check; | &check; |        |        |        |
| Mac (local)         | &check; |        |        |        | &check; |        |        |


## Range of Screenshot

| chrome | firefox | edge | ie11 | safari | ios safari | android chrome |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| Full Page &lowast;1 | Full Page &lowast;1 | Full Page | Full Page &lowast;1 | Full Page &lowast;2  | Full Page &lowast;1 | Above the Fold |

- &lowast;1. As native, above the fold but it's emulated with window scrolling.  
- &lowast;2. In case of Safari10~ & Selenium3~. Otherwise Above the fold

## Run as Standalone

### Clone this repository
```sh
git clone https://github.com/igari/capium.git
````

### Install Node Package Modules
```sh
npm i
````

### Try out (on your local environment)

#### Execute Command

```bash
npm run ss
```
If you run above command, Firefox start and get screenshot of Google and Yahoo!


#### Check `./output` directory
Then you can see screenshots(png) of Google and Yahoo!

### Setup

Edit `./config.js`

```js
module.exports = {
	pages: [
		"https://www.google.com/",
		"http://www.yahoo.com/"
	],
	caps: [
		{ "browserName": "chrome" },
		{ "browserName": "firefox" }
	]
};
```

## TIPS

### If you get an error of missing driver
1. Get driver from http://www.seleniumhq.org/download/
2. Enable the binary to be run from anywhere

### If you use safari, turn on `Allow Remote Automation` before running.
Safari > Develop > Allow Remote Automation.

### Executing Webdriver API by page
Edit Page Settings

```js

module.exports = {
  pages: [
    {
      url: "https://www.google.com/",
      
      //Write here to execute webdriver api (Plain Webdriver Syntax)
      wd: function (driver, webdriver) {
        return driver
          .wait(webdriver.until.elementLocated(webdriver.By.className("LaunchApp__closeIcon")), 10*1000, 'Could not found close button')
          .then(function (element) {
              return element.click();
          });
      }
    }
  ],
  caps: [
    {
      "browserName": "chrome",
    }
  ]
};
```

### Specifying Basic Authentication Username and Password
Include Username and Password into the URL.

```js
module.exports = [
  {
    url: "http://username:password@example.com"
  }
];
```

#### Caution!!!
Take care to be not published the secret information.

### Use BrowserStack for Remote Testing

Edit Capability to specify `browserstack.user` and `browserstack.key`.
```js
module.exports = [
  {
    "browserName": "chrome",
    "os": "windows",
    "browserstack.user": "xxxxxxxxxxx",
    "browserstack.key": "xxxxxxxxxxxxx"
  }
];
```

See [all capabilities of BrowserStack](https://www.browserstack.com/automate/capabilities)

#### Local tesing with BrowserStack (if you want to test on local server e.g. http://localhost)
```js
module.exports = [
  {
    "browserName": "chrome",
    "os": "windows",
    "browserstack.user": "xxxxxxxxxxx",
    "browserstack.key": "xxxxxxxxxxxxx",
    "browserstack.local": 'true'//Just add this!!
  }
];
```
### Use SauceLabs for Remote Testing

Edit Capability to specify `username` and `accessKey`.

```json
{
  "browserName": "chrome",
  "os": "windows",
  "username": "xxxxxxxxxxx",
  "accessKey": "xxxxxxxxxxxxx"
}
```
See [all capabilities of SauceLabs](https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options)

#### Local testing with Sauce Connect of Sauce Labs (if you want to test on local server e.g. http://localhost)

Download & Use [Sauce Connect](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy);

##### Basic Usage
```bash
./sc-4.3.6-osx/bin/sc- u ${username} -k ${accesskey}
```

##### In the case of Basic Authenticated URL:
```bash
./sc-4.3.6-osx/bin/sc -u ${saucelabs_username} -k ${saucelabs_accesskey} -a ${host}:${port}:${basicauth_username}:${basicauth_password}
```

`-a` options is possible to be specified multiple time.

##### Experimental Capability

You are able to use  `Sauce Connect` when only `sauceConnect` parameter is added.

```json
{
  "browserName": "chrome",
  "os": "windows",
  "username": "xxxxxxxxxxx",
  "accessKey": "xxxxxxxxxxxxx",
  "sauceConnect": true//Just add this!!
}
```


## Dependencies

- [Node.js](https://nodejs.org/) v6.4.0~
- [JRE](https://java.com/ja/download/) 1.8~
- [Graphics Magick](http://www.graphicsmagick.org)
- [Selenium Standalone](https://www.npmjs.com/package/selenium-standalone)

## Remote testing tools used by Capium.

They are awesome cloud testing services using real browsers and devices.

<a href="https://www.browserstack.com/"><img src="https://style-validator.io/img/browserstack-logo.svg" width="350" style="vertical-align: middle;"></a><br>
<br>
<a href="https://saucelabs.com/"><img src="https://saucelabs.com/content/images/logo@2x.png" width="350" style="vertical-align: middle;"></a><br>


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
- Runnable `npm test` to test this app.

## Roadmap

###### v0.7.1
- Runnable on windows also correctly.
- Detectable error more finely.

## Testing

```sh
npm test
```
