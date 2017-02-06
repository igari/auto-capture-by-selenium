"use strict";

const mkdirp = require('mkdirp');
const path = require('path');

var util = {
	makeDir: function(fileName) {
		return new Promise(function(resolve, reject) {
			mkdirp(path.dirname(fileName), function(err) {
				if (err) throw err;
				resolve();
			});
		});
	}
};

module.exports = util;