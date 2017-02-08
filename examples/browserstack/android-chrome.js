const capium = require('./../../lib/capium.js');

capium({
	pages: [
		{
			url: "http://www.google.com"
		},
		{
			url: "http://www.yahoo.com"
		},
		{
			url: "http://www.apple.com"
		}
	],
	caps: [
		{
			"browserName": "chrome",
			"os": "android",
			"browserstack.user": "!!!!!!!FIXME!!!!!!!!!",
			"browserstack.key": "!!!!!!!FIXME!!!!!!!!!",
			// "browserstack.local": true
		}
	]
});