#!/usr/bin/env node

// Define command line usage
var argv = require('yargs')
		.usage('Usage: file [options]')
		.demand(1)
		.help('help').alias('help', 'h')
		.options({
			'output': {
				alias: 'o',
				describe: 'The output path',
				requiresArg: true,
				string: true
			},
			'image-file-extension': {
				alias: 'x',
				describe: 'Change the extension of the image file names to the provided one',
				requiresArg: true,
				string: true
			},
			'pretty': {
				alias: 'p',
				describe: 'Pretty-print the JSON output'
			}
		})
		.argv;

var parse = require('../');
var fs = require('fs');

// Validate image file extension
if (argv.imageFileExtension) {
	var newExtension = argv.imageFileExtension.replace(/^\./, '');
	if (!/^\w+$/.test(newExtension)) {
		throw 'Invalid image file extension: ' + argv.imageFileExtension;
	}
	argv.imageFileExtension = newExtension;
}

fs.readFile( argv._[0], function(err, data) {
	if (err)
		throw "Could not open "+argv._[0]+"\n"+err;

	var obj = parse(data);

	if (argv.imageFileExtension) {
		var pages = obj.pages;
		for (var i = 0; i < pages.length; i++) {
			pages[i] = pages[i].replace(/(.\.)\w+$/, '$1' + argv.imageFileExtension);
		}
	}

	var jsonOut = JSON.stringify(obj, undefined, argv.p ? 2 : undefined);

	var writer = argv.o ? fs.createWriteStream(argv.o) : process.stdout;
	writer.write(jsonOut+ (argv.p?'\n':''));
});
