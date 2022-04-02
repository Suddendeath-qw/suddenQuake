"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
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
        var helpstring = pre + "{" + is + "}" + suf;
        console.log(i + ":" + charcode, pre, clr.bgRed(is), suf);
        //console.log("%d: char (%d) not found, %s", i, charcode, helpstring)
        return charcode;
    }
}
function Mvd_ParseFile(fpath) {
    var e_1, _a;
    var buf = fs.readFileSync(fpath);
    var idxMatchOver = buf.indexOf("The match is over");
    var idxFinalScores = buf.indexOf("//finalscores");
    var idxJsonStart = buf.indexOf('{"version":');
    var idxEndStats = idxJsonStart > 0 ? idxJsonStart : idxFinalScores;
    var b_endScores = buf.subarray(idxMatchOver, idxEndStats);
    b_endScores = Mvc_StripBuffer(b_endScores);
    //let team = o.indexOf(" vs ")
    var t = b_endScores.subarray();
    // Varje rad börjar med?
    // 0 = NULL null
    // 8 = BS Backspace
    // 2 = STX (Start of Text)
    // 10 = LineFeed
    // 16
    // 32 -> space
    // 37 -> %
    // 40 -> (
    // 41 -> )
    // 46 -> .
    // 48 - 57 -> 0-9
    // 58 -> :
    // 61 -> =
    // 65 - 90 -> A-Z
    // 97 - 122 -> a-z
    // 135 -> [] red? square
    // 144 É -> [ gold
    // 145 æ -> ] gold
    // 157 -> <= left
    // 158 ->  = middle
    // 159 ->  => right
    // 189 ¢ -> = red
    //
    // 215 -> w
    // 240 -> p
    var i = 0;
    for (i = 0; i < b_endScores.length; i++) {
        b_endScores[i] = Mvd_ParseCharcode(b_endScores[i], i, b_endScores);
    }
    console.log(b_endScores.toString());
    console.log();
    i = 0;
    try {
        for (var _b = __values(t.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var value = _c.value;
            //console.log(i, ":", value)
            i++;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
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
