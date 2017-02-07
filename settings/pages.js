module.exports = [
	{
		url: "https://www.google.co.jp/",
		executeScript: function () {
			return 'a'
		},
		executeAsyncScript: function async() {
			let parentArgs = async.caller.arguments;
			let callback = parentArgs[parentArgs.length - 1];
			callback('b');
		}
	},
	{
		url: "http://www.yahoo.co.jp/",
		executeScript: function () {
			return 'a'
		},
		executeAsyncScript: function async() {
			let parentArgs = async.caller.arguments;
			let callback = parentArgs[parentArgs.length - 1];
			callback('b');
		}
	},
	{
		url: "http://www.apple.com/",
		executeScript: function () {
			return 'a'
		},
		executeAsyncScript: function async() {
			let parentArgs = async.caller.arguments;
			let callback = parentArgs[parentArgs.length - 1];
			callback('b');
		}
	}
];