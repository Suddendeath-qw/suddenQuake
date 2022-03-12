import fs from "fs"
import path from "path"
import crypto from "crypto"

// TODO
// Normalize Quad, Q, Quadrun?
// armr&mhs => armrmhs
// rl skill => rlskill
// spawnfrags move up in output object
// TYPESCRIPT THIS FILE

let c = {
    lines: null,
    i: 0,
    len: 0
}

let data = {
    id: null,
    date: null,
    mvd: null,
    map: null,
    teams: {},
}

main();

function main () {
    let logStr, logEnd, jsonName
    try {
        const fileName = getFileNameFromArgs();
        jsonName = path.basename(fileName, path.extname(fileName)) + ".json"
        const logfile = fs.readFileSync(fileName);
        logStr = logfile.toString()
        logEnd = logStr.slice(logStr.search(/The match is over/));
    } catch (e) {
        console.error(e)
    }

    // Match date
    let m = logStr.match(/matchdate\:\s(.+)/)
    const matchDate = m && m[1]

    // Mvd name
    m = logStr.match(/Server\sstarts\srecording\s\((?:memory|disk)\)\:\s(.+)/)
    const mvdName = m && m[1]

    // Hash
    const id = crypto.createHash("sha1").update(mvdName).digest("hex")

    // Lines
    const lines = logStr.split("\n")

    data.id = id;
    data.mvd = mvdName;
    data.date = matchDate;

    c.lines = ["logparser begin", ...lines];
    c.len = lines.length;

    Log_ParseLines();
    console.log(data.map, data.mvd, data.date)
    fs.writeFileSync(jsonName, JSON.stringify(data, null, 2))
}

function getFileNameFromArgs() {
    let fileName;
    process.argv.forEach(arg => {
        if (path.extname(arg) === ".log") fileName = path.join(process.cwd(), arg)
    });
    return fileName;
}

function Log_ParseLines () {
    while (c.i < c.len) {
        let line = c.lines[c.i];
        if (line.match(/Team\s\[.{0,4}\]\:/i)) Log_ParseTeam();
        //if (line.match(/\[.{0,4}\]\svs\s\[.{0,4}\]/)) Log_MatchStats();
        if (line.match(/\[.+\]\stop\sscorers\:/i)) Log_TopScorers();
        if (line.match(/Team\sscores/i)) Log_TeamScores();

        // Go to next line
        c.i++;
    }
}

function Log_TeamScores () {
    let m;
    let nTeams = 0;

    do {
        let ln = c.lines[c.i];

        if (m = ln.match(/\[(.+)\]\:\s([0-9\-]+)[\s\.]*([0-9\.\%]+)/i)) {
            if (data.teams.hasOwnProperty(m[1])) {
                nTeams++;
                data.teams[m[1]].frags = parseInt(m[2])
                data.teams[m[1]].eff = parseFloat(m[3])
                //console.log(c.i, data.teams[m[1]].frags, data.teams[m[1]].eff)
            }
            continue;
        }
    } while (nTeams < Object.keys(data.teams).length && c.i++ && c.i < c.lines.length)
        
}

function Log_TopScorers () {

    let topscorers = {}
    let m;
    let cat;

    do {    
        let ln = c.lines[c.i];
        // Map
        if (m = ln.match(/\[([a-z0-9]+)\]\stop\sscorers\:/)) {
            data.map = m[1]
            continue;
        }

        // Category
        if (m = ln.trim().match(/^([a-z\s]+)\:\s(.+)\s\[([0-9\.\%]+)\]/i)) {
            cat = m[1].replace(" ", "_").toLowerCase()
            topscorers[cat] = new Array()
            topscorers[cat].push({ name: m[2], score: parseFloat(m[3])})
            continue;
        }

        // Player from last category
        if (m = ln.trim().match(/^([^\:]+)\s\[([0-9\.\%]+)\]/)) {
            topscorers[cat].push({ name: m[1], score: parseFloat(m[2])})
            continue;
        }

    } while (c.i++ && c.lines[c.i].length > 2)

    // Save topscorers
    data.top = topscorers
}

function Log_MatchStats () {
    let tCount = 0;

    do {

    } while (tCount < 2)

}

function Log_ParseTeam() {
    let team = {
        name: "",
        frags: 0,
        eff: 0,
        players: []
    }

    let p = -1;
    let players = [];

    do {
        let ln = c.lines[c.i];
        let m;

        //console.log(c.i, ln)

        // Row: Team name
        if (m = ln.match(/Team\s\[(.{0,4})\]\:/)) {
            team.name = m[1];
            //console.log(c.i, team.name)
            continue;
        }

        /*if (ln.match(/^([\_]+)[\r\n ]+$/)) {

            continue;
        }*/

        // Row: Player name
        if (m = ln.match(/^\_\s(.+)\:/)) {        
            // Begin of new player, save old
            p++;
            players[p] = { name: m[1] }
            //console.log(c.i, m[1])
        
            continue;
        }

        // Row: Frags (net) friendkills . efficiency
        // 86 (39) 6 64.7%
        if (m = ln.match(/\s\s([0-9\-]+)\s\(([0-9\-]+)\)\s([0-9]+)\s([0-9\.\%]+)/)) {
            players[p].frags = parseInt(m[1])
            players[p].net = parseInt(m[2])
            players[p].tk = parseInt(m[3])
            players[p].eff = parseFloat(m[4])
            //console.log(c.i, players[p])
            
            continue;
        }
        
        // Wp: rl71.0% gl44.0% sg45.3% ssg26.8%
        if (m = ln.match(/Wp:\s([a-z0-9\.\%]+)?\s(?:\([0-9\/]+\))?\s?([a-z0-9\.\%]+)?\s([a-z0-9\.\%]+)?\s([a-z0-9\.\%]+)?\s([a-z0-9\.\%]+)?/i)) {
            //console.log(c.i, m.slice(1))
            players[p].wp = {}
            m.slice(1).forEach(wp => {
                if (!wp) return;
                wp = wp.match(/^([a-z]+)([0-9\.]+)/)
                players[p].wp[wp[1].toLowerCase()] = parseFloat(wp[2]) 
            })
            continue;
        }

        // Row 
        /*
            RL skill: ad:83.7 dh:8
            Armr&mhs: ga:7 ya:3 ra:0 mh:3
            Powerups: Q:1 P:0 R:0
                RL: Took:5 Killed:4 Dropped:4 Xfer:3
            Damage: Tkn:8789 Gvn:7432 EWep:1304 Tm:374 Self:257 ToDie:127
                Time: Quad:27
            Streaks: Frags:9 QuadRun:2
        */
        if (m = ln.trim().match(/^([a-z\s\&]+)\:\s([a-z]+\:[0-9\.]+)\s?([a-z]+\:[0-9\.]+)?\s?([a-z]+\:[0-9\.]+)?\s?([a-z]+\:[0-9\.]+)?\s?([a-z]+\:[0-9\.]+)?\s?([a-z]+\:[0-9\.]+)?/i)) {
            //console.log(c.i, m)
            m[1] = m[1].trim().replace(' ', '_').toLowerCase();
            players[p][m[1]] = {}
            m.slice(2).forEach(cl => {
                if (!cl) return;
                cl = cl.split(':')
                players[p][m[1]][cl[0].toLowerCase()] = parseFloat(cl[1]) 
            })

            //console.log(c.i, m[1])
            continue;
        }

        if (m = ln.match(/SpawnFrags\:\s([0-9]+)/i)) {
            players[p].spawnfrags = parseInt(m[1])
            //console.log(c.i, "spawnfrags", player.spawnfrags)
        }
        //console.log(c.i - 1, "->", c.i, p, team.name, c.lines[c.i].charCodeAt(0))

    } while (c.i++ && !c.lines[c.i].match(/^[\r\n\s]+$/) && c.lines[c.i].charCodeAt(0) !== 13 && c.lines[c.i].length > 2)

    // Save team
    team.players = players
    data.teams[team.name] = team 
    //console.log(c.i, "save_team", team.name)
}
