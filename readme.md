Parses BMFont files (XML/TXT) to JSON objects, with a command-line tool for easy conversion.

## example

```js
var fs = require('fs');
var bmfont2json = require('bmfont2json');

//grab the Buffer or a string of our data
var data = fs.readFileSync(__dirname + '/myfile.fnt');

//the bitmap font data as an object
var obj = bmfont2json(data);

//we can stringify it if we want...
var json = JSON.stingify( obj );
```

The function parses a string (or Node Buffer) that is either XML data (with a root <font> element), or TXT data (following [Bitmap Font spec](http://www.angelcode.com/products/bmfont/doc/file_format.html)). 

The output looks something like the following JSON. It tries to stay true to the BMFont spec.

```js
{
     pages: [
         "sheet_0.png", 
         "sheet_1.png"
     ],
     chars: [
         { chnl, height, id, page, width, x, y, xoffset, yoffset, xadvance },
         ...
     ],
     info: { ... },
     common: { ... },
     kernings: [
         { first, second, amount }
     ]
}
```

See [here](https://github.com/mattdesl/bmfont2json/wiki/JsonSpec) for a more complete JSON output.

## command-line tool

Converts a single file. If no output is provided, it prints to stdout.

```
Install
    npm install bmfont2json -g

Usage:
    bmfont2json file [options]

Options:
    -o, --ouput the output path
    -p, --pretty pretty print the JSON output
```