var TXT = 'txt',
    XML = 'xml';

var parseAscii = require('parse-bmfont-ascii');
var parseXML = require('parse-bmfont-xml');

/**
 * Parses a string (or Node Buffer) that is either XML data (with a root <font> element),
 * or TXT data (following Bitmap Font spec: http://www.angelcode.com/products/bmfont/doc/file_format.html).
 *
 * The output looks something like the following JSON. It tries to stay true to the BMFont spec.
 * 
 * ```json
 * {
 *      pages: [
 *          "sheet_0.png", 
 *          "sheet_1.png"
 *      ],
 *      chars: [
 *          { chnl, height, id, page, width, x, y, xoffset, yoffset, xadvance },
 *          ...
 *      ],
 *      info: { ... },
 *      common: { ... },
 *      kernings: [
 *          { first, second, amount }
 *      ]
 * }
 * ```
 *
 * If no format is provided, it will be guessed based on the starting characters of
 * the data.
 *
 * @param {String|Buffer} data the input data of the TXT/XML file
 * @param {String} format an explicit format, either 'xml' or 'txt', otherwise guesses format
 */
function parse(data, format) {
    if (!data)
        throw "no data provided";

    data = data.toString().trim();
    
    if (!format) {
        if (data.substring(0,4) === 'info')
            format = TXT;
        else if (data.charAt(0) === '<')
            format = XML;
        else
            throw "malformed XML/TXT bitmap font file";
    }
    
    if (format !== XML && format !== TXT)
        throw "only xml and txt formats are currently supported";
    
    if (format === TXT) {
        return parseAscii(data);
    } else {
        return parseXML(data);
    }
}


module.exports = parse;