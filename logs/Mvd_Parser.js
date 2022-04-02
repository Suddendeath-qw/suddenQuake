"use strict";
exports.__esModule = true;
exports.Mvd_Parser = void 0;
var clr = require("ansi-colors");
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
var Mvd_Parser = /** @class */ (function () {
    function Mvd_Parser(buf) {
        this.buf = this.stripControlChars(buf);
        // Get metadata
        this.metadata = this.getMetadata(this.buf);
        // Slice buffer (only need the stats in memory)
        this.buf = this.getEndGameStats(this.buf);
        this.parseMvd();
    }
    Mvd_Parser.prototype.getStats = function () {
        // Create a string
        var stats = this.metadata.join('\n');
        stats = stats + '\n' + this.buf.toString();
        return stats;
    };
    Mvd_Parser.prototype.toString = function () {
        return this.buf.toString();
    };
    Mvd_Parser.prototype.getMetadata = function (buf) {
        var metadata;
        var match;
        var idxStart, idxEnd;
        var str;
        metadata = [];
        // Matchdate
        idxStart = this.buf.indexOf("matchdate:");
        idxEnd = this.buf.indexOf("\n", idxStart);
        str = this.buf.subarray(idxStart, idxEnd).toString();
        if (match = str.match(/matchdate\: ([0-9]{4}\-[0-9]{2}\-[0-9]{2}\s[0-9]{2}\:[0-9]{2}\:[0-9]{2}\s[a-z]{0,5})/mi)) {
            metadata.push(match[0]);
        }
        // Mvd
        idxStart = this.buf.indexOf("Server starts recording");
        idxEnd = this.buf.indexOf(".mvd", idxStart) + 4;
        str = this.buf.subarray(idxStart, idxEnd).toString();
        if (match = str.match(/Server starts recording \([a-z]+\)\:\s(.+\.mvd)/mi)) {
            metadata.push(match[0].replace(/[\r\n]+/g, ' ').trim());
        }
        return metadata;
    };
    Mvd_Parser.prototype.getEndGameStats = function (buf) {
        var idxMatchOver = buf.indexOf("The match is over");
        var idxFinalScores = buf.indexOf("//finalscores");
        var idxJsonStart = buf.indexOf('{"version":');
        var idxEndStats = idxJsonStart > 0 ? idxJsonStart : idxFinalScores;
        // Slice out end game stats to subarray
        return buf.subarray(idxMatchOver, idxEndStats);
    };
    Mvd_Parser.prototype.stripControlChars = function (buf) {
        var newBufferChars = [];
        var i;
        for (i = 0; i < buf.length; i++) {
            if (STRIP_CHARS.includes(buf[i]))
                continue;
            newBufferChars.push(buf[i]);
        }
        return Buffer.from(newBufferChars);
    };
    Mvd_Parser.prototype.parseMvd = function () {
        var buf = this.buf;
        // Parse the stats quake chars
        var i = 0;
        for (i = 0; i < buf.length; i++) {
            buf[i] = this.parseQuakeChar(buf[i], i, buf);
        }
    };
    Mvd_Parser.prototype.parseQuakeChar = function (charcode, i, buf) {
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
            console.log(i + ":" + charcode, pre, clr.bgRed(is), suf);
            //console.log("%d: char (%d) not found, %s", i, charcode, helpstring)
            return charcode;
        }
    };
    return Mvd_Parser;
}());
exports.Mvd_Parser = Mvd_Parser;
