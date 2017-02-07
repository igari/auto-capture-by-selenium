# Capium

A tool which is able to get screenshot of web page by specified url.
It supports local testing and remote testing with BrowserStack or SauceLabs.

## Dependencies

- Node.js v6.4.0~
- [JRE](https://java.com/ja/download/) 1.8~
- [Graphics Magick](http://www.graphicsmagick.org)
- [Selenium Standalone](https://www.npmjs.com/package/selenium-standalone)
- [mochawesome](http://adamgruber.github.io/mochawesome/)

## Installation

### Clone this repository
```sh
git clone https://github.com/igari/capium.git
````

### Install Node Package Modules
```sh
npm i
````

### install `graphic magick`
```bash
brew install imagemagick
brew install graphicsmagick
```

### install each driver of browsers

If you have remote testing tools(e.g. `BrowserStack` or `SauceLabs`), you don't need to do these things.
Then I recommend for using remote testing tools because it's soooooo easy.

#### Chromedriver for Google Chrome
Already been downloaded and set the PATH.
So there is nothing to do.

#### Geckodriver for Firefox
1. Get driver from https://github.com/mozilla/geckodriver/releases
2. Put the binary file into where you'd like to put.(e.g. `/usr/local/bin/`)
3. Add `PATH` setting your shell config file (`.bashrc` or `.zshrc`).

If you put into `/usr/local/bin/`
```sh
export PATH=$PATH:/usr/local/bin/geckodriver
```

#### Safaridriver
Already been exist from safari10.
So there is nothing to do.


#### Others
1. Get driver from http://www.seleniumhq.org/download/
2. Set Environment PATH to the driver binary

## Try out (on your local)

### Execute Command

```bash
npm run ss
```
If you run above command, Firefox start and get screenshot of Google and Yahoo!


### Check `./output` directory
Then you can see screenshots(png) of Google and Yahoo!

## Setup

### Setup about page
Edit `./settings/pages.js`

```js
module.exports = [
  {
    url: "https://www.google.co.jp/",
    executeScript: function () {
      return 'a'
    },
    executeAsyncScript: function func() {
      let parentArgs = func.caller.arguments;
      let callback = parentArgs[parentArgs.length - 1];
      callback('b');
    }
  }
];
```

### Setup about Browsers Capabilities
Edit `./settings/caps.js`

```js
module.exports = [
  {
    "browserName": "safari",
    "os": "mac",
  },
  {
    "browserName": "firefox",
    "os": "mac"
  }
];
```


## TIPS

### If you use safari, turn on `Allow Remote Automation` before running.
Safari > Develop > Allow Remote Automation.

### Executing JavaScript by page which specified
Edit `./settings/pages.js`

#### sync
```js
module.exports = [
  {
    url: "https://www.google.co.jp/",
    executeScript: function () {
    
      //Any Code
      
      return 'any value'
    }
  }
];
```

#### async
```js
module.exports = [
  {
    url: "https://www.google.co.jp/",
    executeAsyncScript: function func() {
      let parentArgs = func.caller.arguments;
      let callback = parentArgs[parentArgs.length - 1];
      
      //Any Code
      
      callback('any value');//This is important for finishing.
    }
  }
];
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

Edit `./settings/caps.js` to specify `browserstack.user` and `browserstack.key`.
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

#### Local tesing with BrowserStack (if you want to test on local server e.g. http://localhost)
```bash
./BrowserStackLocal --key ${accesskey}
```

### Use SauceLabs for Remote Testing

Edit `./settings/caps.js` to specify `username` and `accessKey`.

```js
module.exports = [
  {
    "browserName": "chrome",
    "os": "windows",
    "username": "xxxxxxxxxxx",
    "accessKey": "xxxxxxxxxxxxx"
  }
];
```

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


### Browser Supports

|              | chrome | firefox | edge | ie11 | safari | iphone safari | android chrome |
| ------------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| Browser Stack (remote)| &check; | &check;  | &check; | &check;| &check; | &check; | &check; |
| Sauce Labs (remote)  | &check;| &check;| &check; | &check;| &check; | &triangle; | &triangle; |
| Windows (local)     | &check; | &check; | &check; | &check; |        |        |        |
| Mac (local)         | &check; |        |        |        | &check; |        |        |


### Range of Screenshot

| chrome | firefox | edge | ie11 | safari | ios safari | android chrome |
| ------ | ------ | ------ | ------ | ------ | ------ | ------ |
| Above the Fold*2 | Full Page | Full Page | Full Page | Full Page*1  | Above the Fold*2 | Above the Fold*2 |

*1) In case of Safari10~ & Selenium3~. Otherwise Above the fold
*2) --fullscreen options make it available for fullscreen screenshot as experimental


### os and browser

|              | chrome | firefox | safari | edge | ie11 |
| ------------ | ------ | ------ | ------ | ------ | ------ |
| windows      | &check; | &check; |      | &check;| &check; |
| mac          | &check; | &check; | &check; |      |       |
| android*1      | &check; |       |        |        |       |
| ios*1          | &check; |       | &check; |       |        |
| android_emulator | &check; |       |        |        |       |
| ios_emulator | &check; |       | &check; |       |        |

*1 Currently not supported


# Run Programmatically

## Install to your project
```sh
npm i capium --save-dev
```

## Basic Usage

```js
const capium = require('capium');

capium({
  pages: [
    {
      url: "https://www.google.co.jp/"
    }
  ],
  caps: [
    {
      "browserName": "chrome"
    }
  ]
});

```

## Advanced Usage

Remote Testing and Execution of JavaScript

```js
const capium = require('capium');

capium({
  pages: [
    {
      url: "https://www.google.co.jp/",
      executeScript: function () {
        return 'a'
      },
    },
    {
      url: "http://www.yahoo.co.jp/",
      executeAsyncScript: function async() {
        let parentArgs = async.caller.arguments;
        let callback = parentArgs[parentArgs.length - 1];
        callback('b');
      }
    }
  ],
  caps: [
    {
      "browserName": "chrome",
      "os": "mac",
      'browserstack.user': 'xxxxxxxxxxxxxx',//Add user for Browser Stack
      'browserstack.key' : 'xxxxxxxxxxxxxx'//Add key for Browser Stack
    },
    {
      "browserName": "chrome",
      "os": "mac",
      'username': 'xxxxxxxxxxxxxx',//Add user for Sauce Labs
      'accessKey' : 'xxxxxxxxxxxxxx'//Add key for Sauce Labs
    },
    {
      "browserName": "chrome",
      "os": "mac"
    }
  ]
});

```

## Remote testing tools used by Capium.

- Browser Stack
- Sauce Labs