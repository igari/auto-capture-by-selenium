"use strict";

const mkdirp = require('mkdirp');
const path = require('path');
const EventEmitter = require('events');
const ee = new EventEmitter();
const colors = require('colors');
const colorsConfig = require('./colors-config.js');
colors.setTheme(colorsConfig);

var util = {
	makeDir: function(fileName) {
		return new Promise(function(resolve, reject) {
			mkdirp(path.dirname(fileName), function(err) {
				if (err) throw err;
				resolve();
			});
		});
	},
	throwError: function (error) {
		let _error = new Error(error);
		ee.emit('error', _error);
		throw _error;
	},
	colors: colors,
	ee: ee
};

module.exports = util;