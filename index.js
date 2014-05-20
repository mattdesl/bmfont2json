var TXT = 'txt',
    XML = 'xml';

var xml2js = require('xml2js');

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
    

    //TODO: Support binary format. 
    //Use a different module for parsing binary spec, this way it
    //can be used at runtime the browser without depending on the XML/TXT parser
    
    var output = {
        pages: [],
        chars: [],
        kernings: []
    };

    if (format === TXT) {
        var lines = data.split(/\r\n?|\n/g);

        if (lines.length === 0)
            throw "no data in BMFont file";

        var parsingChars = false;
        var parsingKern = false;

        for (var i=0; i<lines.length; i++) {
            var lineData = splitLine(lines[i], i);
            if (lineData.key === "page") {
                if (typeof lineData.data.id !== "number")
                    throw "malformed file at line "+i+" -- needs page id=N";
                if (typeof lineData.data.file !== "string")
                    throw "malformed file at line "+i+" -- needs page file=\"path\"";
                output.pages[ lineData.data.id ] = lineData.data.file;
            } 
            else if (lineData.key === "chars" || lineData.key === "kernings") {
                //... do nothing for these two ...
            } 
            else if (lineData.key === "char") {
                output.chars.push(lineData.data);
            } 
            else if (lineData.key === "kerning") {
                output.kernings.push(lineData.data);
            }
            else {
                output[ lineData.key ] = lineData.data;
            }
        }
    } else {
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
    }
    return output;
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

function splitLine(line, idx) {
    line = line.trim();
    var space = line.indexOf(' ');
    if (space === -1)
        throw "no named row at line "+idx;

    var key = line.substring(0, space);

    line = line.substring(space+1);
    line = line.split("=");
    line = line.map(function(str) {
        return str.match((/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g));    
    });

    var data = [];
    for (var i=0; i<line.length; i++) {
        var dt = line[i];
        if (i===0) {
            data.push({
                key: dt[0],
                data: "" 
            });
        } else if (i===line.length-1) {
            data[data.length-1].data = parseData(dt[0]);
        } else {
            data[data.length-1].data = parseData(dt[0]);
            data.push({
                key: dt[1],
                data: ""
            });
        }
    }

    var out = {
        key: key,
        data: {}
    };

    data.forEach(function(v) {
        out.data[ v.key ] = v.data;
    });
    
    return out;
}

function parseData(data) {
    if (!data || data.length === 0)
        return "";

    if (data.indexOf('"') === 0 || data.indexOf("'") === 0)
        return data.substring(1, data.length-1);
    if (data.indexOf(',') !== -1)
        return parseIntList(data);
    return parseInt(data, 10);
}

function parseIntList(data) {
    return data.split(',').map(function(val) {
        return parseInt(val, 10);
    });
}

module.exports = parse;