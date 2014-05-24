Converts BMFont files (XML/TXT) to JSON objects.

## example

```js
var data = fs.readFileSync('myfile.fnt');

var bmfont2json = require('bmfont2json');

var json = JSON.stingify( bmfont2json(data) );
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