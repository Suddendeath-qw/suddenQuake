import * as fs from "fs"
import * as path from "path"
import * as crypto from "crypto"
import * as clr from "ansi-colors"
import {PlayerData, MatchDataObj} from "./logtypes"
/*
 * ====================================================================
 *
 * Definitions
 *
 * ====================================================================
 */

const emptyPlayerData = ():PlayerData => ({
    team: "",
    name: "",
    frags: 0,
    net: 0,
    tk: 0,
    eff: 0,
    wp: { sg: 0, ssg: 0, ng: 0, sng: 0, gl: 0, rl: 0, lg: 0 },
    rlskill: { ad: 0, dh: 0 },
    armrmhs: { ga: 0, ya: 0, ra: 0, mh: 0 },
    powerups: { q: 0, p: 0, r: 0 },
    rl: { took: 0, killed: 0, dropped: 0, xfer: 0 },
    lg: { took: 0, killed: 0, dropped: 0, xfer: 0 },
    damage: { tkn: 0, gvn: 0, ewep: 0, tm: 0, self: 0, todie: 0 },
    time: { quad: 0 },
    streaks: { frags: 0, quadrun: 0 },
    spawnfrags: 0
});

const emptyMatchDataObj = ():MatchDataObj => ({
    id: "",
    date: "",
    mvd: "",
    map: "",
    teams: {}
});

const CHARSET = {
    10: 10, // LF (LineFeed)

    16: 91, // [ (gold [) 144-128 actually works here
    17: 93, // [ (gold [) 145-128 actually works here
    18: 48, // 0 gold??? NOT CONFIRMED
    19: 49, // 1 gold??? NOT CONFIRMED
    20: 50, // 2 gold??? NOT CONFIRMED
    21: 51, // 3 gold??? NOT CONFIRMED
    22: 52, // 4 gold??? NOT CONFIRMED
    23: 53, // 5 gold??? NOT CONFIRMED
    24: 54, // CAN becomes gold 6? 152-128???
    28: 46, // . (. mid white slackers) 156-128 works here

    135: 35, // # (square red?)

    // -128 applied here
    143: 46, // . (. mid gold?) 
    144: 91, // [ (gold [)
    145: 93, // ] (gold ])
    156: 46, // . (. mid white?)
    // --------------------

    157: 60, // < (left <=)
    158: 61, // = (middle in <===>)
    159: 62, // > (right =>)

    // 160 - 254
    // Red characters
    // space ! " #
    // a-zA-Z
    // 0-9 etc...
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

/*
 * ====================================================================
 *
 * Classes
 *
 * ====================================================================
 */

class Mvd_Parser {
    buf:Buffer

    metadata: Array<string>

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
        //console.log(stats);
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

        // Mvd
        idxStart = this.buf.indexOf("Server starts recording");
        idxEnd = this.buf.indexOf(".mvd", idxStart) + 4;
        str = this.buf.subarray(idxStart, idxEnd).toString();
        if (match = str.match(/Server starts recording \([a-z]+\)\:\s(.+\.mvd)/mi)) {
            metadata.push(match[0].replace(/[\r\n]+/g, ' ').trim());
        }

        // Matchdate
        idxStart = this.buf.indexOf("matchdate:");
        idxEnd = this.buf.indexOf("\n", idxStart);
        str = this.buf.subarray(idxStart, idxEnd).toString()
        if (match = str.match(/matchdate\: ([0-9]{4}\-[0-9]{2}\-[0-9]{2}\s[0-9]{2}\:[0-9]{2}\:[0-9]{2}\s[a-z]{0,5})/mi)) {
            metadata.push(match[0]);
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
        // Normalize "red chars", secondary color in charset
        // Probably the entire range 143-160 is -128, but not confirmed
        if (charcode > 143 && charcode < 157) charcode -= 128;
        else if (charcode > 160 && charcode < 255) charcode -= 128;

        // Nothing wrong with normal ASCII-chars
        if (charcode > 31 && charcode < 127) return charcode;
        else if (CHARSET.hasOwnProperty(charcode)) return CHARSET[charcode];
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

export class MatchData implements MatchDataObj {
    id = ""
    date = ""
    mvd = ""
    map = ""
    teams = null
    top = null

    constructor (m: MatchDataObj) {
        this.id = m.id
        this.date = m.date
        this.mvd = m.mvd
        this.map = m.map
        this.teams = m.teams
        this.top = m.top
    }
}

class LineCursor  {
    lines: Array<string>
    len: number
    n: number

    constructor (buf:Buffer) {
        this.lines = buf.toString().split('\n').map(line => {
            //console.log(line.trim())
            return line.trim();
        });
        // .replace(/[\r\n]+/g, '')
        this.len = this.lines.length
        this.n = 0;

        //console.log("lines", this.len)
    }

    line () { return this.lines[this.n]; }
    next () { return this.n < this.len ? this.lines[++this.n] : null }
    prev () { return this.n > 0 ? this.lines[--this.n] : null }
    num  () { return this.n + 1; }
}

class LineParser {
    lc: LineCursor
    data: MatchData
    over: boolean

    // current
    c_team: string

    re_MatchMvd = /^Server\sstarts\srecording\s\((?:memory|disk)\)\:\s(.+)$/i
    re_MatchDate = /^matchdate\:\s([0-9]{4}\-[0-9]{2}\-[0-9]{2}\s[0-9]{2}\:[0-9]{2}\:[0-9]{2}\s[a-z]+)$/i

    re_PlayerTeam = /^Team\s\[(.+)\]\:$/i
    re_Player = /^\#\s(.+)\:$/i
    re_Player_1 = /^([0-9\-]+)\s\(([0-9\-]+)\)\s([0-9]+)\s([0-9.%]+)$/
    re_Player_2 = /^Wp\:\s([a-z0-9.%]+)?(?:\s?\([0-9]+\/[0-9]+\))?\s?([a-z0-9.%]+)?\s?([a-z0-9.%]+)?\s?([a-z0-9.%]+)?\s?([a-z0-9.%]+)?$/i
    re_Player_3 = /^([a-z\s\&]+)\:\s([a-z]+\:[0-9.]+)\s?([a-z]+\:[0-9.]+)?\s?([a-z]+\:[0-9.]+)?\s?([a-z]+\:[0-9.]+)?\s?([a-z]+\:[0-9.]+)?\s?([a-z]+\:[0-9.]+)?/i
    re_Player_4 = /^SpawnFrags\:\s([0-9]+)$/i
    re_PlayerEnd = /^\<\={8}\>$/
    re_WpStats = /^([a-z]+)([0-9\.%]+)$/i

    re_TopScorers = /\[(.+)\]\stop\sscorers\:$/i
    re_TopCategory = /^([a-z\s]+)\:\s(.+)\s\[([0-9%.\-]+)\]$/i
    re_TopPlayer = /^(.+)\s\[([0-9%.\-]+)\]$/i

    re_TeamScores = /\[(.{0,4})\]\:\s([0-9\-]+)\s\.\s([0-9.%]+)$/i


    constructor (lc:LineCursor, data:MatchData) {
        this.lc = lc;
        this.data = data;
        this.over = false;
    }

    parse ():MatchData {
        let lc = this.lc;
        do {
            //console.log(lc.num(), lc.line());
            this.matchLine(lc.line());
        } while (typeof lc.next() === "string")

        return this.data;
    }

    matchLine (lineText:string) {
        let matches: RegExpMatchArray;
        if (matches = lineText.match(this.re_MatchMvd)) return this.parse_MatchMvd(matches);
        else if (matches = lineText.match(this.re_MatchDate)) return this.parse_MatchDate(matches);
        else if (matches = lineText.match(this.re_PlayerTeam)) return this.parse_PlayerTeam(matches);
        else if (matches = lineText.match(this.re_Player)) return this.parse_Player(matches);
        // TODO: TeamStats
        else if (matches = lineText.match(this.re_TopScorers)) return this.parse_TopScorers(matches);
        else if (matches = lineText.match(this.re_TeamScores)) return this.parse_TeamScores(matches);
    }

    private parse_MatchMvd (m:RegExpMatchArray) {
        this.data.mvd = m[1];
        this.data.id = crypto.createHash("sha1").update(this.data.mvd).digest("hex")
    }

    private parse_MatchDate (m:RegExpMatchArray) {
        this.data.date = m[1];
    }

    private parse_PlayerTeam (m:RegExpMatchArray) {
        //console.log(this.lc.num(), m, "parse_PlayerTeam")
        const teamName = m[1];
        this.data.teams[teamName] = { name: teamName, frags: 0, eff: 0, players: [] };
        this.c_team = teamName;
    }

    private parse_Player (m:RegExpMatchArray) {
        const playerName = m[1];
        let p = emptyPlayerData();
        p.name = playerName;
        p.team = this.c_team;

        if (Object.keys(this.data.teams).length == 1) {
            console.log("     ", clr.black.bgCyan(`${p.team} ${p.name}`))    
        } else {
            console.log("     ", clr.black.bgBlue(`${p.team} ${p.name}`))    
        }

        let ln:string;
        let cols:RegExpMatchArray;
      

        // Next line
        do {
            // Frags (rank) friendkills . efficiency
            // 60 (9) 3 54.1%
            if (cols = this.lc.line().match(this.re_Player_1)) {
                p.frags = parseInt(cols[1])
                p.net = parseInt(cols[2])
                p.tk = parseInt(cols[3])
                p.eff = parseFloat(cols[4])
            } 
            // Wp: rl64.9% gl21.8% sg50.2% ssg35.3%
            else if (cols = this.lc.line().match(this.re_Player_2)) {
                p.wp = {};
                cols.slice(1).forEach(wp => {
                    if (!wp) return;
                    let wps = wp.match(this.re_WpStats);
                    p.wp[wps[1].toLowerCase()] = parseFloat(wps[2]);
                });
            }
            // Stats Row 
            /*
                RL skill: ad:83.7 dh:8
                Armr&mhs: ga:7 ya:3 ra:0 mh:3
                Powerups: Q:1 P:0 R:0
                    RL: Took:5 Killed:4 Dropped:4 Xfer:3
                Damage: Tkn:8789 Gvn:7432 EWep:1304 Tm:374 Self:257 ToDie:127
                    Time: Quad:27
                Streaks: Frags:9 QuadRun:2
            */
            else if (cols = this.lc.line().match(this.re_Player_3)) {
                const rowName = cols[1].replace(/[^a-z0-9]/gi, '').toLowerCase();
                p[rowName] = {};
                cols.slice(2).forEach(col => {
                    if (!col) return;
                    let stat = col.split(':')
                    p[rowName][stat[0].toLowerCase()] = parseFloat(stat[1])
                });

                //console.log(this.lc.num(), cols, this.lc.line())
            }
            else if (cols = this.lc.line().match(this.re_Player_4)) {
                p.spawnfrags = parseInt(cols[1]);
            }


            ln = this.lc.next()
        } while (!ln.match(this.re_PlayerEnd) && ln.length)

        this.data.teams[p.team].players.push(p);
    } // parse_Player (m:RegExpMatchArray)

    private parse_TopScorers (m:RegExpMatchArray) {
        this.data.map = m[1];
        this.data.top = {};
        let ln:string;
        let cols:RegExpMatchArray;
        let scoreName:string;


        do { 
            if (cols = this.lc.line().match(this.re_TopCategory)) {
                scoreName = cols[1].replace(/[^a-z0-9]/gi, '').toLowerCase();
                this.data.top[scoreName] = [];
                this.data.top[scoreName].push({ name: cols[2], score: parseFloat(cols[3]) })
            } else if (cols = this.lc.line().match(this.re_TopPlayer)) {
                this.data.top[scoreName].push({ name: cols[1], score: parseFloat(cols[2]) })
            }

            ln = this.lc.next();
        } while (ln.length)

        //console.log(this.data.top)   
    }

    private parse_TeamScores (m:RegExpMatchArray) {
        const teamName = m[1]; 
        this.data.teams[teamName].frags = parseInt(m[2]);
        this.data.teams[teamName].eff = parseFloat(m[3]);
        //console.log(this.data.teams[teamName])
    }

} // Class LineParser


/*
 * ====================================================================
 *
 * Functions
 *
 * ====================================================================
 */

function Log_ParseFile (fpath:string) {
    const fileInfo = path.parse(fpath);
    console.log("  →", clr.white(`parsing ${fileInfo.name}.mvd`))

    const buf = fs.readFileSync(fpath);
    const mvd = new Mvd_Parser(buf);
    const endStats = mvd.getStats();
    //console.log(endStats);
        
    const lc = new LineCursor(Buffer.from(endStats));
    const md = new MatchData(emptyMatchDataObj());
    const lineParser = new LineParser(lc, md);
    const data = lineParser.parse();
    //console.log(data)

    // WriteJSON
    const outputPath = path.join(process.cwd(), fileInfo.name + ".json");
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log("  →", clr.greenBright(`writing ${fileInfo.name}.json`));
    console.log();
    
    //console.log(data)
}

function Log_ParseFiles (fpath:string) {
    const filenames = fs.readdirSync(fpath)
    filenames.forEach(function(filename) {
        Log_ParseFile(fpath + "/" + filename);
    });
}


function main () {
    try {
        if (!process.argv[2]) throw new Error("usage: node mvd-to-json.js <demofile.mvd|demodir>")
        const fpath = path.join(process.cwd(), process.argv[2])
        if (!fs.existsSync(fpath)) throw new Error("demofile or directory not found")
        
        const fstat = fs.lstatSync(fpath)
        if (fstat.isDirectory()) Log_ParseFiles(fpath)
        else if (fstat.isFile()) Log_ParseFile(fpath)
    } catch (e) {
        console.error(e)
    }
}

main();