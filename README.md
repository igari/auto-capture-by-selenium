# Capium

A tool to get screenshots of web pages so easily and automatically. It works with Selenium3.0 for NodeJS and also be able to connect to BrowserStack and SauceLabs.

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
| Above the Fold*2 | Full Page | Full Page | Full Page | Full Page*1  | Above the Fold*2 | Above the Fold*2 |

*1) In case of Safari10~ & Selenium3~. Otherwise Above the fold


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
		{
			url: "https://www.google.co.jp/"
		},
		{
			url: "http://www.yahoo.co.jp/"
		}
	],
	caps: [
		{
			"browserName": "chrome",
		},
		{
			"browserName": "firefox",
		}
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
      url: "https://www.google.co.jp/",
      
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
    "browserstack.key": true//Just add this!!
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
```bash
./util/sc-4.3.6-osx/bin/sc-u ${username} -k ${accesskey}
```

#### Test page with Basic Authentication in URL
```bash
./util/sc-4.3.6-osx/bin/sc-u ${saucelabs_username} -k ${saucelabs_accesskey} -a ${host}:${port}:${basicauth_username}:${basicauth_password}
```

Then it doesn't need to include username and password for basic authentication into the URL.

ex)
```
./util/sc-4.3.6-osx/bin/sc-u ${username} -k ${accesskey} -a example.com:80:hoge:fuga

```
`-a` options is possible to be specified multiple time.

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


## Roadmap

###### current features
- Possible to get screenshot of web pages if you write only config, it's all fine basically. it can be started sooooo easily as just Selenium.
- Writable additional selenium code when the config is added `wd` property as function
- By default, chrome and firefox and safari is runnable as it is. their drivers will be installed automatically.(safari10's driver is already installed natively.)
- Support for full screenshot except for android.
- SauceLabs can be used with easy config.
- BrowserStack can be used with easy config.
- Local testing is also available with above remote testing services(e.g. localhost site.)

###### v0.7.0
- Writable more flexible config. 
- Detectable error more finely.
- Possible to get full screenshot even if the page is implemented lazyload.

###### v0.7.1
- Writable ful native capability also.
- Runnable `npm test` to test this app.
- Runnable on windows also correctly.

###### v0.7.2
- Set color console message
- Add mocha as test framework.

