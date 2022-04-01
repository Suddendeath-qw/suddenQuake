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
var CHARSET = {
    10: 10,
    135: 35,
    143: 46,
    144: 91,
    145: 93,
    157: 60,
    158: 61,
    159: 62
};
function Mvc_StripBuffer(buf) {
    var newBufferChars = [];
    var i;
    for (i = 0; i < buf.length; i++) {
        if (buf[i] != 10 && buf[i] < 32)
            continue;
        newBufferChars.push(buf[i]);
    }
    return Buffer.from(newBufferChars);
}
function Mvd_ParseCharcode(charcode) {
    // Nothing wrong with normal ASCII-chars
    if (charcode > 31 && charcode < 127)
        return charcode;
    else if (charcode > 160 && charcode < 255)
        return charcode - 128;
    else if (CHARSET[charcode])
        return CHARSET[charcode];
    else {
        console.log("could not find appropriate parse rule for charcode:", charcode);
        return charcode;
    }
}
function Mvd_ParseFile(fpath) {
    var e_1, _a;
    var buf = fs.readFileSync(fpath);
    var matchOver = buf.indexOf("The match is over");
    var finalScores = buf.indexOf("//finalscores");
    var b_endScores = buf.subarray(matchOver, finalScores);
    b_endScores = Mvc_StripBuffer(b_endScores);
    //let team = o.indexOf(" vs ")
    var t = b_endScores.subarray();
    // Varje rad börjar med?
    // 0 = NULL null
    // 8 = BS Backspace
    // 2 = STX (Start of Text)
    // 10 = LineFeed
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
    for (i = 0; i < t.length; i++) {
        t[i] = Mvd_ParseCharcode(t[i]);
    }
    console.log(t.toString());
    //console.log(t.toString())
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
            throw new Error("usage: node logparser.mjs <logfile|logdir>");
        var fpath = path.join(process.cwd(), process.argv[2]);
        if (!fs.existsSync(fpath))
            throw new Error("logfile or directory not found");
        var fstat = fs.lstatSync(fpath);
        if (fstat && fstat.isFile())
            Mvd_ParseFile(fpath);
    }
    catch (e) {
        console.error(e);
    }
}
main();
