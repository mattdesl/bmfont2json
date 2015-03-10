#!/usr/bin/env node

var argv = require('yargs')
				.usage('Usage: file [options]')
				.alias('o', 'output')
				.alias('p', 'pretty')
				.describe('o', 'the output path')
				.describe('p', 'pretty-print the JSON output')
				.demand(1)
				.argv;

var parse = require('../');
var fs = require('fs');

fs.readFile( argv._[0], function(err, data) {
	if (err)
		throw "Could not open "+argv._[0]+"\n"+err;

	var obj = parse(data);

	var jsonOut = JSON.stringify(obj, undefined, argv.p ? 2 : undefined);

	var writer = argv.o ? fs.createWriteStream(argv.o) : process.stdout;
	writer.write(jsonOut+ (argv.p?'\n':''));
})