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
	}
];