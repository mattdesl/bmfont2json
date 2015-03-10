var fs = require('fs');
var path = require('path');
var folders = [ 'xml', 'txt', 'multipage' ];

var paths = folders.map(function(dir) {
    return path.join(__dirname, 'test-files', dir, 'Nexa Light-32.fnt');
});

var test = require('tape');
var bmfont = require('./index');

test('should parse fonts', function(t) {
  paths.forEach(function(p) {
      var f = fs.readFileSync(p);

      var result = bmfont(f);
      t.equal(result.info.face, 'Nexa Light', 'face parsed');
      t.equal(result.chars.length, 96, 'chars parsed');
      t.equal(result.kernings.length, 487, 'kernings parsed');
  });
  
  t.end();
});