"use strict";

const selenium = require('selenium-standalone');
const defaultConfig = require('selenium-standalone/lib/default-config.js');
const capium = require('../scripts/capium.js');

let options = Object.assign(defaultConfig, {
	logger: function(message) {
		console.log(message);
	},
	progressCb: function(totalLength, progressLength, chunkLength) {
		console.log(totalLength, progressLength, chunkLength);
	}
});

const exe = function (settings) {
	selenium.install(options, function () {
		selenium.start(options, function (err, child) {
			capium(settings, options).then(function () {
				if(err) throw err;
				child.kill();
			});
		})
	});
};

module.exports = exe;