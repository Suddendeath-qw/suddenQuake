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

export class Mvd_Parser {
    buf:Buffer

    metadata: [string]

    constructor (buf:Buffer) {
        this.buf = this.stripControlChars(buf);

        // Get metadata
        this.metadata = this.getMetadata(this.buf);

        // Slice buffer (only need the stats in memory)
        this.buf = this.getEndGameStats(this.buf);
        
        this.parseMvd();
    }

    getStats() {
        // Create a string
        let stats = this.metadata.join('\n');
        stats = stats + '\n' + this.buf.toString();

        return stats;
    }

    toString () {
        return this.buf.toString();
    }

    private getMetadata (buf:Buffer) {
        let metadata:Array<string>;
        
        let match:RegExpMatchArray;
        let idxStart:number, idxEnd:number;
        let str:string;

        metadata = [];

        // Matchdate
        idxStart = this.buf.indexOf("matchdate:");
        idxEnd = this.buf.indexOf("\n", idxStart);
        str = this.buf.subarray(idxStart, idxEnd).toString()
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
    }

    private getEndGameStats(buf:Buffer) {
        const idxMatchOver = buf.indexOf("The match is over");
        const idxFinalScores = buf.indexOf("//finalscores");
        const idxJsonStart = buf.indexOf('{"version":');
        const idxEndStats = idxJsonStart > 0 ? idxJsonStart : idxFinalScores;

        // Slice out end game stats to subarray
        return buf.subarray(idxMatchOver, idxEndStats);
    }

    private stripControlChars (buf:Buffer) {
        let newBufferChars = [];
        let i:number;

        for (i = 0; i < buf.length; i++) {
            if (STRIP_CHARS.includes(buf[i])) continue;
            newBufferChars.push(buf[i])
        }

        return Buffer.from(newBufferChars);
    }

    private parseMvd() {
        const buf = this.buf;

        // Parse the stats quake chars
        let i = 0;
        for(i = 0; i < buf.length; i++) {
            buf[i] = this.parseQuakeChar(buf[i], i, buf);
        }
    }

    private parseQuakeChar (charcode:number, i?:number, buf?:Buffer) {
        // Nothing wrong with normal ASCII-chars
        if (charcode > 31 && charcode < 127) return charcode;
        else if (charcode > 160 && charcode < 255) return charcode - 128;
        else if (CHARSET[charcode]) return CHARSET[charcode];
        else {
            const pre = buf.subarray(i-5, i).toString();
            const is = buf.subarray(i, i+1).toString();
            const suf = buf.subarray(i+1, i+5).toString();
    
            console.log(i + ":" + charcode, pre, clr.bgRed(is), suf)
            //console.log("%d: char (%d) not found, %s", i, charcode, helpstring)
            return charcode;
        }
    }
}