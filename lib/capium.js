"use strict";

const selenium = require('selenium-standalone');
const capium = require('../scripts/capium.js');

const exe = function () {
	selenium.install(function () {
		selenium.start(function () {
			capium();
		})
	});
};

module.exports = exe;