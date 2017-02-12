# Run as Standalone

## Clone this repository
```sh
git clone https://github.com/igari/capium.git
````

## Install Node Package Modules
```sh
yarn install
````
or
```sh
npm i
````

## Try out (on your local environment)

### Execute Command

```bash
npm run ss
```
If you run above command, Firefox start and get screenshot of Google and Yahoo!


### Check `./output` directory
Then you can see screenshots(png) of Google and Yahoo!

## Setup

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
