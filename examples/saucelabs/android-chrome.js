const capium = require('./../../lib/capium.js');

capium({
	pages: [
		"http://www.google.com",
		"http://www.apple.com"
	],
	caps: {
		"browserName": "chrome",
		"os": "android",
		"username": "!!!!!!!FIXME!!!!!!!!!",
		"accessKey": "!!!!!!!FIXME!!!!!!!!!"
	}
});