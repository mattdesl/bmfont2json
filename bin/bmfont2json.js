#!/usr/bin/env node

'use strict';

const fs = require('fs');
const parse = require('../');

// Define command line usage
const argv = require('yargs')
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
			'unicode-keys': {
				alias: 'u',
				describe: 'Use Unicode characters as keys in "object.chars" and ' +
						'"object.kernings". For the latter, ".second" is used as an outer key ' +
						'and ".first" as an inner key'
			},
			'assume-one-page': {
				alias: '1',
				describe: 'Replace "object.pages" with "object.imageFileName" and remove the ' +
						'number suffix'
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

// Validate image file extension
if (argv.imageFileExtension) {
	let newExtension = argv.imageFileExtension.replace(/^\./, '');
	if (!/^\w+$/.test(newExtension)) {
		throw `Invalid image file extension: ${argv.imageFileExtension}`;
	}
	argv.imageFileExtension = newExtension;
}

// Convert the file
fs.readFile(argv._[0], function(err, data) {
	if (err) {
		throw `Could not open "${argv._[0]}"\n${err}`;
	}

	// Do the actual conversion
	let object = parse(data);

	if (argv.assumeOnePage) {
		object.imageFileName = object.pages[0].replace(/_0(?=\.\w+$)/, '');
		delete object.pages;
		for (let char of object.chars) {
			delete char.page;
		}
		delete object.common.pages;
	}

	if (argv.imageFileExtension) {
		let changeExtension = function(filename) {
			return filename.replace(/(.\.)\w+$/, `$1${argv.imageFileExtension}`);
		}
		if (argv.assumeOnePage) {
			object.imageFileName = changeExtension(object.imageFileName);
		} else {
			for (let i = 0; i < object.pages.length; i++) {
				object.pages[i] = changeExtension(object.pages[i]);
			}
		}
	}

	if (argv.unicodeKeys) {
		let newChars = { };
		for (let char of object.chars) {
			newChars[String.fromCodePoint(char.id)] = char;
			delete char.id;
		}
		object.chars = newChars;

		let newKernings = { };
		for (let kerning of object.kernings) {
			let firstChar = String.fromCodePoint(kerning.first);
			let secondChar = String.fromCodePoint(kerning.second);
			let newKerning = newKernings[secondChar];
			if (!newKerning) {
				newKerning = newKernings[secondChar] = { };
			}
			newKerning[firstChar] = kerning;
			delete kerning.first;
			delete kerning.second;
		}
		object.kernings = newKernings;
	}

	// Create big JSON string from JavaScript object
	let jsonOut = JSON.stringify(object, undefined, argv.pretty ? '\t' : undefined);
	jsonOut = jsonOut.replace(/[\u0080-\uffff]/g, function(match) {
		// Escape all non-ASCII characters
		return '\\u' + `00${ match.charCodeAt(0).toString(16) }`.slice(-4);
	});

	// Write file (or to stdout)
	let writer = argv.output ? fs.createWriteStream(argv.output) : process.stdout;
	writer.write(jsonOut + (argv.pretty ? '\n' : ''));
});
