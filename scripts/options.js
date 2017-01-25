"use strict";

const argv = require('argv');

argv.option({
	name: 'width',
	short: 'w',
	type: 'string',
	description: 'viewportサイズの幅',
	example: `npm run ss -- --width=1024`
});
argv.option({
	name: 'height',
	short: 'h',
	type: 'string',
	description: 'viewportサイズの高さ',
	example: `npm run ss -- --height=720`
});
argv.option({
	name: 'reporter',
	short: 'r',
	type: 'string',
	description: 'mocha + mochawesome用のパラメータ',
	example: `npm run ss -- --reporter mochawesome`
});
argv.option({
	name: 'reporter-options',
	short: 'o',
	type: 'string',
	description: 'mocha + mochawesomeのオプション用のパラメータ',
	example: `npm run ss -- --reporter-options reportDir=customReportDir,reportFilename=customReportFilename`
});
argv.option({
	name: 'source',
	short: 's',
	type: 'path',
	description: '対象のURLリストを指定します。',
	example: `'npm run ss -- --source=./capture-list.json'`
});
argv.option({
	name: 'browser',
	short: 'b',
	type: 'string',
	description: '起動するブラウザを選択します。選択肢は[chrome, firefox, ie]のいずれかです。',
	example: `'npm run ss -- --browser=chrome'`
});
argv.option({
	name: 'sauceLabsId',
	short: 'u',
	type: 'string',
	description: 'SauceLabsを利用する場合にID（ユーザー名）を指定します。',
	example: `'npm run ss -- --sauceLabsId=xxxxxx --sauceLabsPass=xxxxxx'`
});
argv.option({
	name: 'sauceLabsPass',
	short: 'k',
	type: 'string',
	description: 'SauceLabsを利用する場合にパスワードを指定します。',
	example: `'npm run ss -- --sauceLabsId=xxxxxx --sauceLabsPass=xxxxxx'`
});
argv.option({
	name: 'browserStackId',
	short: '',
	type: 'string',
	description: 'browserStackを利用する場合にID（ユーザー名）を指定します。',
	example: `'npm run ss -- --browserStackId=xxxxxx --browserStackPass=xxxxxx'`
});
argv.option({
	name: 'browserStackPass',
	short: '',
	type: 'string',
	description: 'browserStackを利用する場合にパスワードを指定します。',
	example: `'npm run ss -- --browserStackId=xxxxxx --browserStackPass=xxxxxx'`
});
argv.option({
	name: 'basicAuthId',
	short: 'i',
	type: 'string',
	description: 'Basic認証が必要な場合にID（ユーザー名）を指定します。',
	example: `'npm run ss -- --basicAuthId=xxxxxx --basicAuthPass=xxxxxx'`
});
argv.option({
	name: 'basicAuthPass',
	short: 'p',
	type: 'string',
	description: 'Basic認証が必要な場合にパスワードを指定します。',
	example: `'npm run ss -- --basicAuthId=xxxxxx --basicAuthPass=xxxxxx'`
});

const options = argv.run().options;

module.exports = options;