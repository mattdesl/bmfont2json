BMFont XML/TXT files to JSON output.

```js
var data = fs.readFileSync('myfile.fnt');

var bmfont2json = require('bmfont2json');

var json = JSON.stingify( bmfont2json(data) );
```

Parses a string (or Node Buffer) that is either XML data (with a root <font> element), or TXT data (following [Bitmap Font spec](http://www.angelcode.com/products/bmfont/doc/file_format.html)).

The output looks something like the following JSON. It tries to stay true to the BMFont spec.

```json
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