'use strict';

const fs = require('fs');
const path = require('path');
const folders = [ 'xml', 'txt', 'multipage' ];
const nexa = 'Nexa Light-32.fnt'

let paths = folders.map(function(dir) {
    return path.join(__dirname, 'test-files', dir, nexa);
});

const test = require('tape');
const bmfont = require('./');
const expected = require('./test-files/txt/Test.json');

test('should parse fonts', function(t) {
  paths.forEach(function(p) {
      let f = fs.readFileSync(p);

      let result = bmfont(f);
      t.equal(result.info.face, 'Nexa Light', 'face parsed');
      t.equal(result.chars.length, 96, 'chars parsed');
      t.equal(result.kernings.length, 487, 'kernings parsed');
  });

  t.end();
});

test('should match expected', function(t) {
  let p = path.join(__dirname, 'test-files', 'txt', nexa);
  let f = fs.readFileSync(p);

  let result = bmfont(f);
  t.deepEqual(result, expected, 'matches JSON');
  t.end();
});