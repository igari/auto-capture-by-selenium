const Capium = require('./../../lib/capium.js');

const capium = new Capium({
	pages: [
		"http://www.google.com",
		"http://www.apple.com"
	],
	caps: {
		"browserName": "safari",
		"os": "ios",
		"browserstack.user": "!!!!!!!FIXME!!!!!!!!!",
		"browserstack.key": "!!!!!!!FIXME!!!!!!!!!",
		// "browserstack.local": true
	}
});

capium.run();