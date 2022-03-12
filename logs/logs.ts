import * as fs from "fs"
import * as path from "path"
import * as crypto from "crypto"
import {PlayerData, MatchDataObj, TopScorerStats, TopScorerEntry, TeamDataObj, TeamData} from "./logtypes"

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

class MatchData implements MatchDataObj {
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

        console.log("lines", this.len)
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

    re_MatchOver = /^The\smatch\sis\sover$/i

    re_PlayerTeam = /^Team\s\[(.+)\]\:$/i
    re_Player = /^\_\s(.+)\:$/i
    re_Player_1 = /^([0-9\-]+)\s\(([0-9\-]+)\)\s([0-9]+)\s([0-9\.\%]+)$/
    re_Player_2 = /^Wp\:\s([a-z0-9\.\%]+)?\s?([a-z0-9\.\%]+)?\s?([a-z0-9\.\%]+)?\s?([a-z0-9\.\%]+)?\s?([a-z0-9\.\%]+)?$/i
    re_Player_3 = /^([a-z\s\&]+)\:\s([a-z]+\:[0-9\.]+)\s?([a-z]+\:[0-9\.]+)?\s?([a-z]+\:[0-9\.]+)?\s?([a-z]+\:[0-9\.]+)?\s?([a-z]+\:[0-9\.]+)?\s?([a-z]+\:[0-9\.]+)?/i
    re_Player_4 = /^SpawnFrags\:\s([0-9]+)$/i
    re_PlayerEnd = /^\_{10}$/
    re_WpStats = /^([a-z]+)([0-9\.]+)/i

    re_TopScorers = /\[(.+)\]\stop\sscorers\:$/i


    constructor (lc:LineCursor, data:MatchData) {
        this.lc = lc;
        this.data = data;
        this.over = false;
    }

    parse () {
        let lc = this.lc;
        do {
            //console.log(lc.num(), lc.line());
            this.matchLine(lc.line());
        } while (typeof lc.next() === "string")
    }

    matchLine (lineText:string) {
        let matches: RegExpMatchArray;
        if (matches = lineText.match(this.re_MatchOver)) return this.parse_MatchOver(matches);
        else if (matches = lineText.match(this.re_PlayerTeam)) return this.parse_PlayerTeam(matches);
        else if (matches = lineText.match(this.re_Player)) return this.parse_Player(matches);
        // TODO: TeamStats
        else if (matches = lineText.match(this.re_TopScorers)) return this.parse_TopScorers(matches);
    }

    private parse_MatchOver (m:RegExpMatchArray) {
        //console.log(this.lc.num(), this.lc.line(), "parse_MatchOver")
        this.over = true;
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
    } // parse_Player (m:RegExpMatchArray)

    private parse_TopScorers (m:RegExpMatchArray) {
        this.data.map = m[1];
        let ln:string;
        let topName:string;


        do {


            ln = this.lc.next();
        } while (ln.length)

        console.log(this.lc.num(), m, this.lc.line())
    }
}

function Log_ParseLines (lc:LineCursor, data:MatchData) {
    
}

function Log_ParseFile (fpath:string) {
    const buf = fs.readFileSync(fpath)
    const lc = new LineCursor(buf);
    const md = new MatchData(emptyMatchDataObj());

    const lineParser = new LineParser(lc, md);
    lineParser.parse();
}

function Log_ParseFiles (fpath:string) {
    const filenames = fs.readdirSync(fpath)
    filenames.forEach(function(filename) {
        Log_ParseFile(fpath + "/" + filename);
    });
}

function main () {
    try {
        if (!process.argv[2]) throw new Error("usage: node logparser.mjs <logfile|logdir>")
        const fpath = path.join(process.cwd(), process.argv[2])
        if (!fs.existsSync(fpath)) throw new Error("logfile or directory not found")
        
        const fstat = fs.lstatSync(fpath)
        if (fstat.isDirectory()) Log_ParseFiles(fpath)
        else if (fstat.isFile()) Log_ParseFile(fpath)
    } catch (e) {
        console.error(e)
    }
}

// RUUUUN
main();