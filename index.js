var TXT = 'txt',
    XML = 'xml';

var xml2js = require('xml2js');
var parseAscii = require('parse-bmfont-ascii');

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
        var output = {
            pages: [],
            chars: [],
            kernings: []
        };

        xml2js.parseString(data, function (err, result) {
            if (err)
                throw err;
            if (!result.font)
                throw "XML bitmap font doesn't have <font> root";
            result = result.font;

            output.common = parseXMLAttribs(result.common[0].$);
            output.info = parseXMLAttribs(result.info[0].$);

            for (var i=0; i<result.pages.length; i++) {
                var p = result.pages[i].page[0].$;

                if (typeof p.id === "undefined")
                    throw "malformed file -- needs page id=N";
                if (typeof p.file !== "string")
                    throw "malformed file -- needs page file=\"path\"";

                output.pages[ parseInt(p.id, 10) ] = p.file;
            }

            var chrArray = result.chars[0]['char'] || [];
            for (var i=0; i<chrArray.length; i++) {
                output.chars.push( parseXMLAttribs( chrArray[i].$ ) );
            }

            var kernArray = result.kernings[0]['kerning'] || [];
            for (var i=0; i<kernArray.length; i++) {
                output.kernings.push( parseXMLAttribs( kernArray[i].$ ) );
            }
        });
        return output;
    }
}

function parseXMLAttribs(obj) {
    for (var k in obj) {
        if (k === 'face' || k === 'charset')
            continue;
        else if (k === 'padding' || k === 'spacing')
            obj[k] = parseIntList(obj[k]);
        else
            obj[k] = parseInt(obj[k], 10);
    }
    return obj;
}

function parseIntList(data) {
    return data.split(',').map(function(val) {
        return parseInt(val, 10);
    });
}

module.exports = parse;