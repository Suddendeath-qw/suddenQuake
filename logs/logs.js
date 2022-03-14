"use strict";
exports.__esModule = true;
exports.MatchData = void 0;
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");
var emptyPlayerData = function () { return ({
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
}); };
var emptyMatchDataObj = function () { return ({
    id: "",
    date: "",
    mvd: "",
    map: "",
    teams: {}
}); };
var MatchData = /** @class */ (function () {
    function MatchData(m) {
        this.id = "";
        this.date = "";
        this.mvd = "";
        this.map = "";
        this.teams = null;
        this.top = null;
        this.id = m.id;
        this.date = m.date;
        this.mvd = m.mvd;
        this.map = m.map;
        this.teams = m.teams;
        this.top = m.top;
    }
    return MatchData;
}());
exports.MatchData = MatchData;
var LineCursor = /** @class */ (function () {
    function LineCursor(buf) {
        this.lines = buf.toString().split('\n').map(function (line) {
            //console.log(line.trim())
            return line.trim();
        });
        // .replace(/[\r\n]+/g, '')
        this.len = this.lines.length;
        this.n = 0;
        console.log("lines", this.len);
    }
    LineCursor.prototype.line = function () { return this.lines[this.n]; };
    LineCursor.prototype.next = function () { return this.n < this.len ? this.lines[++this.n] : null; };
    LineCursor.prototype.prev = function () { return this.n > 0 ? this.lines[--this.n] : null; };
    LineCursor.prototype.num = function () { return this.n + 1; };
    return LineCursor;
}());
var LineParser = /** @class */ (function () {
    function LineParser(lc, data) {
        this.re_MatchMvd = /^Server\sstarts\srecording\s\((?:memory|disk)\)\:\s(.+)$/i;
        this.re_MatchDate = /^matchdate\:\s([0-9]{4}\-[0-9]{2}\-[0-9]{2}\s[0-9]{2}\:[0-9]{2}\:[0-9]{2}\s[a-z]+)$/i;
        this.re_PlayerTeam = /^Team\s\[(.+)\]\:$/i;
        this.re_Player = /^\_\s(.+)\:$/i;
        this.re_Player_1 = /^([0-9\-]+)\s\(([0-9\-]+)\)\s([0-9]+)\s([0-9.%]+)$/;
        this.re_Player_2 = /^Wp\:\s([a-z0-9.%]+)?\s?([a-z0-9.%]+)?\s?([a-z0-9.%]+)?\s?([a-z0-9.%]+)?\s?([a-z0-9.%]+)?$/i;
        this.re_Player_3 = /^([a-z\s\&]+)\:\s([a-z]+\:[0-9.]+)\s?([a-z]+\:[0-9.]+)?\s?([a-z]+\:[0-9.]+)?\s?([a-z]+\:[0-9.]+)?\s?([a-z]+\:[0-9.]+)?\s?([a-z]+\:[0-9.]+)?/i;
        this.re_Player_4 = /^SpawnFrags\:\s([0-9]+)$/i;
        this.re_PlayerEnd = /^\_{10}$/;
        this.re_WpStats = /^([a-z]+)([0-9\.]+)/i;
        this.re_TopScorers = /\[(.+)\]\stop\sscorers\:$/i;
        this.re_TopCategory = /^([a-z\s]+)\:\s(.+)\s\[([0-9%.\-]+)\]$/i;
        this.re_TopPlayer = /^(.+)\s\[([0-9%.\-]+)\]$/i;
        this.re_TeamScores = /\[(.{0,4})\]\:\s([0-9\-]+)\s\.\s([0-9.%]+)$/i;
        this.lc = lc;
        this.data = data;
        this.over = false;
    }
    LineParser.prototype.parse = function () {
        var lc = this.lc;
        do {
            //console.log(lc.num(), lc.line());
            this.matchLine(lc.line());
        } while (typeof lc.next() === "string");
        return this.data;
    };
    LineParser.prototype.matchLine = function (lineText) {
        var matches;
        if (matches = lineText.match(this.re_MatchMvd))
            return this.parse_MatchMvd(matches);
        else if (matches = lineText.match(this.re_MatchDate))
            return this.parse_MatchDate(matches);
        else if (matches = lineText.match(this.re_PlayerTeam))
            return this.parse_PlayerTeam(matches);
        else if (matches = lineText.match(this.re_Player))
            return this.parse_Player(matches);
        // TODO: TeamStats
        else if (matches = lineText.match(this.re_TopScorers))
            return this.parse_TopScorers(matches);
        else if (matches = lineText.match(this.re_TeamScores))
            return this.parse_TeamScores(matches);
    };
    LineParser.prototype.parse_MatchMvd = function (m) {
        this.data.mvd = m[1];
        this.data.id = crypto.createHash("sha1").update(this.data.mvd).digest("hex");
    };
    LineParser.prototype.parse_MatchDate = function (m) {
        this.data.date = m[1];
    };
    LineParser.prototype.parse_PlayerTeam = function (m) {
        //console.log(this.lc.num(), m, "parse_PlayerTeam")
        var teamName = m[1];
        this.data.teams[teamName] = { name: teamName, frags: 0, eff: 0, players: [] };
        this.c_team = teamName;
    };
    LineParser.prototype.parse_Player = function (m) {
        var _this = this;
        var playerName = m[1];
        var p = emptyPlayerData();
        p.name = playerName;
        p.team = this.c_team;
        var ln;
        var cols;
        var _loop_1 = function () {
            // Frags (rank) friendkills . efficiency
            // 60 (9) 3 54.1%
            if (cols = this_1.lc.line().match(this_1.re_Player_1)) {
                p.frags = parseInt(cols[1]);
                p.net = parseInt(cols[2]);
                p.tk = parseInt(cols[3]);
                p.eff = parseFloat(cols[4]);
            }
            // Wp: rl64.9% gl21.8% sg50.2% ssg35.3%
            else if (cols = this_1.lc.line().match(this_1.re_Player_2)) {
                p.wp = {};
                cols.slice(1).forEach(function (wp) {
                    if (!wp)
                        return;
                    var wps = wp.match(_this.re_WpStats);
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
            else if (cols = this_1.lc.line().match(this_1.re_Player_3)) {
                var rowName_1 = cols[1].replace(/[^a-z0-9]/gi, '').toLowerCase();
                p[rowName_1] = {};
                cols.slice(2).forEach(function (col) {
                    if (!col)
                        return;
                    var stat = col.split(':');
                    p[rowName_1][stat[0].toLowerCase()] = parseFloat(stat[1]);
                });
                //console.log(this.lc.num(), cols, this.lc.line())
            }
            else if (cols = this_1.lc.line().match(this_1.re_Player_4)) {
                p.spawnfrags = parseInt(cols[1]);
            }
            ln = this_1.lc.next();
        };
        var this_1 = this;
        // Next line
        do {
            _loop_1();
        } while (!ln.match(this.re_PlayerEnd) && ln.length);
        this.data.teams[p.team].players.push(p);
    }; // parse_Player (m:RegExpMatchArray)
    LineParser.prototype.parse_TopScorers = function (m) {
        this.data.map = m[1];
        this.data.top = {};
        var ln;
        var cols;
        var scoreName;
        do {
            if (cols = this.lc.line().match(this.re_TopCategory)) {
                scoreName = cols[1].replace(/[^a-z0-9]/gi, '').toLowerCase();
                this.data.top[scoreName] = [];
                this.data.top[scoreName].push({ name: cols[2], score: parseFloat(cols[3]) });
            }
            else if (cols = this.lc.line().match(this.re_TopPlayer)) {
                this.data.top[scoreName].push({ name: cols[1], score: parseFloat(cols[2]) });
            }
            ln = this.lc.next();
        } while (ln.length);
        //console.log(this.data.top)   
    };
    LineParser.prototype.parse_TeamScores = function (m) {
        var teamName = m[1];
        this.data.teams[teamName].frags = parseInt(m[2]);
        this.data.teams[teamName].eff = parseFloat(m[3]);
        //console.log(this.data.teams[teamName])
    };
    return LineParser;
}()); // Class LineParser
function Log_ParseFile(fpath) {
    var buf = fs.readFileSync(fpath);
    var lc = new LineCursor(buf);
    var md = new MatchData(emptyMatchDataObj());
    var lineParser = new LineParser(lc, md);
    var data = lineParser.parse();
    // WriteJSON
    var outputPath = path.join(process.cwd(), path.parse(fpath).name + ".json");
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    //console.log(data)
}
function Log_ParseFiles(fpath) {
    var filenames = fs.readdirSync(fpath);
    filenames.forEach(function (filename) {
        Log_ParseFile(fpath + "/" + filename);
    });
}
function main() {
    try {
        if (!process.argv[2])
            throw new Error("usage: node logparser.mjs <logfile|logdir>");
        var fpath = path.join(process.cwd(), process.argv[2]);
        if (!fs.existsSync(fpath))
            throw new Error("logfile or directory not found");
        var fstat = fs.lstatSync(fpath);
        if (fstat.isDirectory())
            Log_ParseFiles(fpath);
        else if (fstat.isFile())
            Log_ParseFile(fpath);
    }
    catch (e) {
        console.error(e);
    }
}
// RUUUUN
main();
