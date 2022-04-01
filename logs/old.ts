import * as fs from "fs"
import * as path from "path"

const CHARSET = {
    10: 10, // LF (LineFeed)
    135: 35, // # (square red?)
    143: 46, // . (mid . white?)
    144: 91, // [ (gold [)
    145: 93, // ] (gold ])
    157: 60, // < (left <=)
    158: 61, // = (middle in <===>)
    159: 62, // > (right =>)

}

function Mvc_StripBuffer (buf:Buffer) {
    let newBufferChars = [];
    let i:number;
    
    for(i = 0; i < buf.length; i++) {
        if (buf[i] != 10 && buf[i] < 32) continue;
        newBufferChars.push(buf[i])
    }

    return Buffer.from(newBufferChars);
}

function Mvd_ParseCharcode (charcode:number) {
    // Nothing wrong with normal ASCII-chars
    if (charcode > 31 && charcode < 127) return charcode;
    else if (charcode > 160 && charcode < 255) return charcode - 128;
    else if (CHARSET[charcode]) return CHARSET[charcode];
    else {
        console.log("could not find appropriate parse rule for charcode:", charcode)
        return charcode;
    }
}

function Mvd_ParseFile (fpath:string) {
    const buf = fs.readFileSync(fpath);
    let matchOver = buf.indexOf("The match is over");
    let finalScores = buf.indexOf("//finalscores");
    
    let b_endScores = buf.subarray(matchOver, finalScores)
    b_endScores = Mvc_StripBuffer(b_endScores);
    //let team = o.indexOf(" vs ")
    let t = b_endScores.subarray()

    
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


    let i = 0;
    for(i = 0; i < t.length; i++) {
        t[i] = Mvd_ParseCharcode(t[i]);
    }

    console.log(t.toString())
    //console.log(t.toString())
    
    console.log()
    
    i = 0;
    for (const value of t.values()) {
        //console.log(i, ":", value)
        i++;
    }
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