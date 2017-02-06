"use strict";

const argv = require('argv');

argv.option({
	name: 'pages',
	short: 'p',
	type: 'path',
	description: '対象のURLリストを指定します。',
	example: 'npm run ss -- --pages=./pages.js'
});
argv.option({
	name: 'caps',
	short: 'c',
	type: 'path',
	description: '起動するブラウザを選択します。選択肢は[chrome, firefox, ie11, edge, safari]のいずれかです。',
	example: 'npm run ss -- --caps=./caps.js'
});
argv.option({
	name: 'option',
	short: 'o',
	type: 'path',
	description: '起動するブラウザを選択します。選択肢は[chrome, firefox, ie11, edge, safari]のいずれかです。',
	example: 'npm run ss -- --option=./option.js'
});

const option = argv.run().options;

module.exports = option;