var fs = require('fs');
var path = require('path');
var folders = [ 'xml', 'txt', 'multipage' ];

var paths = folders.map(function(dir) {
    return path.join(__dirname, 'test-files', dir, 'Nexa Light-32.fnt');
});

var assert = require('assert');
var bmfont = require('./index');

paths.forEach(function(p) {
    var f = fs.readFileSync(p);

    var result = bmfont(f);
    assert(result.info.face === 'Nexa Light', 'face exported');
    assert(result.chars.length === 96, 'chars exported');
    assert(result.kernings.length === 487, 'kernings exported');
});