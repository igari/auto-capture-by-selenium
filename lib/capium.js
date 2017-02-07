"use strict";

const selenium = require('selenium-standalone');
const capium = require('../scripts/capium.js');

const exe = function (settings) {
	selenium.install(function () {
		selenium.start(function () {
			capium(settings);
		})
	});
};

module.exports = exe;