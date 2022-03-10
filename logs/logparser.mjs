import fs from "fs"
import path from "path"
import crypto from "crypto"

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
    fs.writeFileSync(jsonName, JSON.stringify(data))
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
        if (line.match(/Team\s\[.{0,4}\]\:/)) Log_ParseTeam();
        //if (line.match(/\[.{0,4}\]\svs\s\[.{0,4}\]/)) Log_MatchStats();
        if (line.match(/\[.+\]\stop\sscorers\:/)) Log_TopScorers();
        if (line.match(/\[.{0,4}\]\:\s[0-4]+/)) Log_TeamScores();

        // Go to next line
        c.i++;
    }
}

function Log_TeamScores () {
    let ln = c.lines[c.i];
    let m = ln.match(/\[(.{0,4})\]\:\s([0-9]+)\s\.\s([0-9\.\%]+)/)
    if (!m || !data.teams.hasOwnProperty(m[1])) return;

    data.teams[m[1]].frags = parseInt(m[2])
    data.teams[m[1]].eff = parseFloat(m[3])
}

function Log_TopScorers () {
    let ln = c.lines[c.i];
    data.map = ln.match(/\[(.+)\]/)[1]
    console.log(c.i, data.map)
    let topscorers = {}
    let cat;

    do {
        let col;
        ln = c.lines[c.i].trim()
        let m = ln.match(/^([a-z\sA-Z]+)\:/)
        if (m) cat = m[1].replace(" ", "_").toLowerCase()

        col = ln.split(" ").slice(-2)
        if (col.length < 2) break;
        col[1] = parseFloat(col[1].replace(/[\[\]]/g, ""))

        topscorers[cat] = topscorers[cat] || []
        topscorers[cat].push({ name: col[0], score: col[1] })

    } while (c.lines[++c.i].match(/^[\r\n ]+$/))

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
        players: []
    }

    let player;

    do {
        let ln = c.lines[c.i];
        let m;

        // Row: Team name
        if (m = ln.match(/Team\s\[(.{0,4})\]\:/)) {
            team.name = m[1];
            //console.log(c.i, team.name)
            continue;
        }

        if (ln.match(/^([\_]+)[\r\n ]+$/)) {
            // Row: __________
            // Begin of new player, save old
            if (player) team.players.push(player)
            //console.log(c.i, "save", player && player.name)
            player = {} // reset
            continue;
        }

        // Row: Player name
        if (m = ln.match(/^\_\s(.+)\:/)) {
            player.name = m[1]
            //console.log(c.i, m[1])
            continue;
        }

        // Row: Frags (net) friendkills . efficiency
        // 86 (39) 6 64.7%
        if (m = ln.match(/\s\s([0-9]+)\s\(([0-9]+)\)\s([0-9]+)\s([0-9\.\%]+)/)) {
            player.frags = parseInt(m[1])
            player.net = parseInt(m[2])
            player.tk = parseInt(m[3])
            player.eff = parseFloat(m[4])
            //console.log(c.i, player)
            continue;
        }
        
        // Wp: rl71.0% gl44.0% sg45.3% ssg26.8%
        if (m = ln.match(/Wp:\s([a-z0-9\.\%]+)?\s(?:\([0-9\/]+\))?\s?([a-z0-9\.\%]+)?\s([a-z0-9\.\%]+)?\s([a-z0-9\.\%]+)?\s([a-z0-9\.\%]+)?/i)) {
            //console.log(c.i, m.slice(1))
            player.wp = {}
            m.slice(1).forEach(wp => {
                if (!wp) return;
                wp = wp.match(/^([a-z]+)([0-9\.]+)/)
                player.wp[wp[1].toLowerCase()] = parseFloat(wp[2]) 
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
        if (m = ln.trim().match(/^(.+)\:\s([a-z]+:[0-9\.]+)\s?([a-z]+:[0-9\.]+)?\s?([a-z]+:[0-9\.]+)?\s?([a-z]+:[0-9\.]+)?([a-z]+:[0-9\.]+)?\s?([a-z]+:[0-9\.]+)?/i)) {
            m[1] = m[1].trim().replace(' ', '_').toLowerCase();
            player[m[1]] = {}
            m.slice(2).forEach(cl => {
                if (!cl) return;
                cl = cl.split(':')
                player[m[1]][cl[0].toLowerCase()] = parseFloat(cl[1]) 
            })

            //console.log(c.i, m[1])
            continue;
        }

        if (m = ln.match(/SpawnFrags\:\s([0-9]+)/i)) {
            player.spawnfrags = parseInt(m[1])
            //console.log(c.i, "spawnfrags", player.spawnfrags)
        }
        //console.log(c.i - 1, "->", c.i, "player.name", team.name, c.lines[c.i].charCodeAt(0))


    } while (!c.lines[++c.i].match(/^[\r\n ]+$/))

    // Save team
    data.teams[team.name] = team;
    //console.log(c.i, "save_team", team.name)
}
