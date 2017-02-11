const Capium = require('./../../lib/capium.js');

const capium = new Capium({
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

capium.run();