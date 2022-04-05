import * as fs from "fs"
import * as path from "path"
import * as clr from "ansi-colors"

const CHARSET = {
    10: 10, // LF (LineFeed)
    16: 91, // [ (gold [) 144-128 actually works here
    17: 93, // [ (gold [) 144-128 actually works here
    24: 54, // CAN becomes gold 6?
    28: 46, // . (. mid white slackers) 156-128 works here
    135: 35, // # (square red?)
    143: 46, // . (. mid gold?) 
    144: 91, // [ (gold [)
    145: 93, // ] (gold ])
    156: 46, // . (. mid white?)
    157: 60, // < (left <=)
    158: 61, // = (middle in <===>)
    159: 62, // > (right =>)
};

const STRIP_CHARS = [
    0, // null
    1, // SOH - Start of Header
    2, // STX - Start of Text
    3, // ETX - End of Text
    4, // EOT - End of Transmission
    8, // BS - Backspace
    9, // HT - Horizontal Tab
    31, // US - Unit separator
];

function Mvc_StripBuffer (buf:Buffer) {
    let newBufferChars = [];
    let i:number;
    
    for(i = 0; i < buf.length; i++) {
        //if (buf[i] < 32 && !CHARSET.hasOwnProperty(buf[i])) continue;
        if (STRIP_CHARS.includes(buf[i])) continue;
        newBufferChars.push(buf[i])
    }

    return Buffer.from(newBufferChars);
}

function Mvd_ParseCharcode (charcode:number, i?:number, buf?:Buffer) {
    // Nothing wrong with normal ASCII-chars
    if (charcode > 31 && charcode < 127) return charcode;
    else if (charcode > 160 && charcode < 255) return charcode - 128;
    else if (CHARSET[charcode]) return CHARSET[charcode];
    else {
        const pre = buf.subarray(i-5, i).toString();
        const is = buf.subarray(i, i+1).toString();
        const suf = buf.subarray(i+1, i+5).toString();

        //console.log(i + ":" + charcode, pre, clr.bgRed(is), suf)
        //console.log("%d: char (%d) not found, %s", i, charcode, helpstring)
        return charcode;
    }
}

function Mvd_ParseFile (fpath:string) {
    const buf = fs.readFileSync(fpath);
    const idxMatchOver = buf.indexOf("The match is over");
    const idxFinalScores = buf.indexOf("//finalscores");
    const idxJsonStart = buf.indexOf('{"version":');
    const idxEndStats = idxJsonStart > 0 ? idxJsonStart : idxFinalScores;

    let bufStats = buf.subarray(idxMatchOver, idxEndStats)
    bufStats = Mvc_StripBuffer(buf);

    let i = 0;
    for(i = 0; i < bufStats.length; i++) {
        bufStats[i] = Mvd_ParseCharcode(bufStats[i], i, bufStats);
    }

    console.log(bufStats.toString())
    console.log()
}

function main () {
    try {
        if (!process.argv[2]) throw new Error("usage: node old.js <demofile.mvd>")
        const fpath = path.join(process.cwd(), process.argv[2])
        if (!fs.existsSync(fpath)) throw new Error("demo file not found")
        
        const fstat = fs.lstatSync(fpath)
        if (fstat && fstat.isFile()) Mvd_ParseFile(fpath);
    } catch (e) {
        console.error(e)
    }
}

main();