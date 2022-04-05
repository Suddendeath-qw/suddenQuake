"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var CHARSET = {
    10: 10,
    16: 91,
    17: 93,
    24: 54,
    28: 46,
    135: 35,
    143: 46,
    144: 91,
    145: 93,
    156: 46,
    157: 60,
    158: 61,
    159: 62
};
var STRIP_CHARS = [
    0,
    1,
    2,
    3,
    4,
    8,
    9,
    31, // US - Unit separator
];
function Mvc_StripBuffer(buf) {
    var newBufferChars = [];
    var i;
    for (i = 0; i < buf.length; i++) {
        //if (buf[i] < 32 && !CHARSET.hasOwnProperty(buf[i])) continue;
        if (STRIP_CHARS.includes(buf[i]))
            continue;
        newBufferChars.push(buf[i]);
    }
    return Buffer.from(newBufferChars);
}
function Mvd_ParseCharcode(charcode, i, buf) {
    // Nothing wrong with normal ASCII-chars
    if (charcode > 31 && charcode < 127)
        return charcode;
    else if (charcode > 160 && charcode < 255)
        return charcode - 128;
    else if (CHARSET[charcode])
        return CHARSET[charcode];
    else {
        var pre = buf.subarray(i - 5, i).toString();
        var is = buf.subarray(i, i + 1).toString();
        var suf = buf.subarray(i + 1, i + 5).toString();
        //console.log(i + ":" + charcode, pre, clr.bgRed(is), suf)
        //console.log("%d: char (%d) not found, %s", i, charcode, helpstring)
        return charcode;
    }
}
function Mvd_ParseFile(fpath) {
    var buf = fs.readFileSync(fpath);
    var idxMatchOver = buf.indexOf("The match is over");
    var idxFinalScores = buf.indexOf("//finalscores");
    var idxJsonStart = buf.indexOf('{"version":');
    var idxEndStats = idxJsonStart > 0 ? idxJsonStart : idxFinalScores;
    var bufStats = buf.subarray(idxMatchOver, idxEndStats);
    bufStats = Mvc_StripBuffer(buf);
    var i = 0;
    for (i = 0; i < bufStats.length; i++) {
        bufStats[i] = Mvd_ParseCharcode(bufStats[i], i, bufStats);
    }
    console.log(bufStats.toString());
    console.log();
}
function main() {
    try {
        if (!process.argv[2])
            throw new Error("usage: node old.js <demofile.mvd>");
        var fpath = path.join(process.cwd(), process.argv[2]);
        if (!fs.existsSync(fpath))
            throw new Error("demo file not found");
        var fstat = fs.lstatSync(fpath);
        if (fstat && fstat.isFile())
            Mvd_ParseFile(fpath);
    }
    catch (e) {
        console.error(e);
    }
}
main();
