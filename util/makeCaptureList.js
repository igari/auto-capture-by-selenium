var AUTO_CAPTUER = {};
var fs = require('fs');
var path = require('path');
var argv = require('argv');
var captureConfig = require('../capture-config');

AUTO_CAPTUER.MakeCaptureList = function () {
	this.init();
};
AUTO_CAPTUER.MakeCaptureList.prototype = {
	init: function () {
		var _this = this;
		this.setOptions();
		this.setParameters();

		var validateResult = this.validateInput();
		if( !validateResult.isValid ) {
			console.log( validateResult.message );
			return;
		}

		this.readAllFiles( this.readFilePath, function () {
			_this.parseCaptureList();
		});
	},
	setOptions: function() {
		argv.option([
			{
				name: 'rootDir',
				short: 'r',
				type: 'string',
				description: 'URLリストを生成する際のルートディレクトリを指定します。',
				example: 'node makeCaptureList.js --roodDir=./../../'
			},
			{
				name: 'prefix',
				short: 'p',
				type: 'string',
				description: 'URLに不要な接頭辞がある場合は指定します。指定された文字列を除去します。',
				example: 'node makeCaptureList.js --prefix=./../../'
			},
			{
				name: 'host',
				short: 'h',
				type: 'string',
				description: 'ホスト名を入力します。デフォルトはlocalhostになります。',
				example: 'node makeCaptureList.js --host=localhost'
			}
		])
	},
	setParameters: function () {
		this.argv = argv.run();
		this.conf = captureConfig.captureList;
		this.readFilePath = this.argv.options.roodDir || this.conf.inputDir;
		this.lastDirName = this.readFilePath.match(/\/([a-z]|[0-9]|-|_)*\/$/);
		this.prefix = this.argv.options.prefix || this.readFilePath.substr( 0, this.readFilePath.length - this.lastDirName[0].length );
		this.hostName = this.argv.options.host || 'http://localhost';
		this.files = [];
	},
	validateInput: function () {
		var isValid = true;
		var message = '';
		if( !this.readFilePath ) {
			isValid = false;
			message = 'You have to input a path to read as first args.';
		}
		return {
			isValid: isValid,
			message: message
		};
	},
	readAllFiles: function ( dirPath, callback ) {
		var _this = this;

		if( this.dirQueue === undefined ) {
			this.dirQueue = [];
		}

		this.dirQueue.push( dirPath );

		fs.readdir( dirPath, function ( err, files ) {
			if( err ) throw err;

			if( files.length === 0 ) {
				_this.readAllFilesAfter( dirPath, callback );
				return;
			}

			_this.syncEach( files, function ( file, next ) {
				var pathname = dirPath + file;
				var s = fs.statSync( pathname );

				if( s.isDirectory() ) {
					_this.readAllFiles( pathname + '/', callback );
				}
				else if( s.isFile() ) {
					_this.files.push( pathname );
				}
				next();

			}, function () {
				_this.readAllFilesAfter( dirPath, callback );
			});
		});
	},
	readAllFilesAfter: function( dirPath, callback ) {
		var index = this.dirQueue.indexOf( dirPath );
		if( index > -1 ) {
			this.dirQueue.splice( index, 1 );
		}
		if( this.dirQueue.length === 0 ) {
			this.dirQueue = undefined;
			if( callback !== undefined && typeof callback === 'function' ) {
				callback();
			}
		}
	},
	parseCaptureList: function () {
		var _this = this;
		var capturePaths = [];
		var pcPath = [];
		var spPath = [];

		this.syncEach( this.files,
			function ( value, next ) {
				var extname = path.extname( value );
				if( extname !== _this.conf.inputExtension ) {
					next();
					return;
				}
				if( _this.prefix !== undefined ) {
					value = value.replace( _this.prefix, '' );
					capturePaths.push( _this.hostName + value );
				}
				next();
			},
			function () {
				_this.writeJsonFile( capturePaths );

				var destPath = path.normalize( _this.conf.destName );
				console.log('INFO: make file "' + destPath + '".');
			}
		);
	},
	writeJsonFile: function ( pathList ) {
		var _this = this;
		var dataFormat = this.conf.destFormat;

		for( var key in this.conf.destFormat ) {
			var targetPath = dataFormat[key];
			var targetPathList = pathList.filter(function ( value ) {
				return value.indexOf( targetPath ) > -1;
			});

			dataFormat[key] = targetPathList;
		}
		var jsonData = {
			'captureTarget': [dataFormat]
		};
		fs.writeFile( this.conf.destName, JSON.stringify( jsonData, null, ' ' ) );
	},
	syncEach: function ( array, callback, complete ) {
		var len = array.length - 1;

		array.forEach( function ( value, index ) {
			callback( value, function () {
				if( len === index ) {
					complete();
				}
			});
		});
	}
};
new AUTO_CAPTUER.MakeCaptureList();