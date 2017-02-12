var Mocha = require('mocha'),
	fs = require('fs'),
	path = require('path');

// Instantiate a Mocha instance.
var mocha = new Mocha({
	reporter: 'mochawesome'
});

var testDir = './test/spec';

// Add each .js file to the mocha instance
fs.readdirSync(testDir).filter(function(file){
	// Only keep the .js files
	return file.substr(-3) === '.js';

}).forEach(function(file){
	mocha.addFile(
		path.join(testDir, file)
	);
});

// Run the tests.
mocha.run(function(failures){
	process.on('exit', function () {
		process.exit(failures);  // exit with non-zero status if there were failures
	});
})
.then(function (data) {
	console.log(data);
});