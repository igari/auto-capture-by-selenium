const Capium = require('./../../lib/capium.js');

const capium = new Capium({
	pages: [
		"http://www.google.com",
		"http://www.apple.com"
	],
	caps: {
		"_browserName": "safari",
		"_os": "ios",
		"browserstack.user": "!!!!!!!FIXME!!!!!!!!!",
		"browserstack.key": "!!!!!!!FIXME!!!!!!!!!",
		// "browserstack.local": true
	}
});

capium.run();