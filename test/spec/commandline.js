const os = /^win/.test(process.platform) ? 'windows' : 'mac';
const path = require('path');
const assert = require('assert');
const child_process = require('child_process');
describe(`test on ${os} from commandline`, function () {
	this.timeout(60*60*1000);

	it('run from commandline', function (done) {
		let child = child_process.spawn('npm', ['run', 'ss']);
		child.stdout.on('data', function(data) {
			console.log(data.toString());
		});
		child.on('error', function(data) {
			assert(false, data.toString());
		});
		child.on('close', function(code) {
			assert(code === 0, `closed with code: ${code}`);
			return done();
		});
	});
});
