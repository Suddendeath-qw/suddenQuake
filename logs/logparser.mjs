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
    const lines = logEnd.split("\n")

    data.id = id;
    data.mvd = mvdName;
    data.date = matchDate;

    c.lines = lines;
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
        if (line.match(/\[.{0,4}\]\svs\s\[.{0,4}\]/)) Log_MatchStats();
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
    let topscorers = {}
    let cat;

    // Skip a row of -----------
    c.i++;
    c.i++;

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

    } while (c.lines[++c.i] !== '\r')

    // Save topscorers
    data.top = topscorers
}

function Log_MatchStats () {
    let tCount = 0;

    do {
        let col;
        let row;
        let charIndex;
        let ln = c.lines[++c.i]
        ln = ln.replace(/\_/g, "")

        // check if line is start of team
        let m = ln.match(/^\[(.{0,4})\]/)
        if (!m || !data.teams.hasOwnProperty(m[1])) continue;    

        // It is a team!
        tCount++;
        let tStats = {}
        let tName = m[1]

        // Weapon stats
        col = ln.split(" ").slice(2)
        tStats.wp = {}
        col.forEach((wp, i) => {
            wp = wp.match(/^([a-z]+)([0-9\.]+)/)
            tStats.wp[wp[1].toLowerCase()] = parseFloat(wp[2]) 
        })

        // Next 5 rows:
        let r = 5;
        while (r--) {
            ln = c.lines[++c.i].trim()
            charIndex = ln.indexOf(":")
            row = ln.slice(0, charIndex).replace(/[\s\&]/g, "_").toLowerCase()
            col = ln.slice(charIndex + 1).trim().split(' ')
            tStats[row] = {}
            col.forEach(a => {
                a = a.split(":")
                tStats[row][a[0].toLowerCase()] = parseFloat(a[1])
            })
        }

        // Save team stats
        data.teams[tName].teamStats = tStats;
    } while (tCount < 2)
}

function Log_ParseTeam() {
    let team = {
        players: []
    }
    let ln = c.lines[c.i];

    // Team name
    team.name = ln.match(/Team\s\[(.{0,4})\]\:/)[1];
    // Skip one line
    c.i = c.i + 2

    // Players
    do {
        let col;
        let row;
        let charIndex;

        let player = {
            team: team.name
        }

        // Player name
        ln = c.lines[c.i]
        let name = ln.match(/^\_\s(.+)\:/)
        if (!name) {
            c.i++;
            continue;
        }
        player.name = name[1];

        // Next row: Frags (net) friendkills . efficiency
        // 86 (39) 6 64.7%
        ln = c.lines[++c.i].trim()
        col = ln.split(' ')
        player.frags = parseInt(col[0])
        player.net = parseInt(col[1].replace(/[()]/g, ''))
        player.tk = parseInt(col[2])
        player.eff = parseFloat(col[3]) / 100

        // Next row: wp-stats
        // Wp: rl82.3% gl10.0% sg51.1% ssg42.9%
        ln = c.lines[++c.i].trim()
        col = ln.split(' ').slice(1)
        player.wp = {}
        col.forEach((wp, i) => {
            wp = wp.match(/^([a-z]+)([0-9\.]+)/)
            if (!wp) return;
            player.wp[wp[1].toLowerCase()] = parseFloat(wp[2]) 
        })

        // Next X rows:
        do {
            ln = c.lines[++c.i].trim()
            let m = ln.match(/^(.+)\:\s(.+)/)
            if (!m) break; // this is not a stats row, next player
            let row = m[1].toLowerCase()
            player[row] = {}
            let cols = m[2].split(' ')
            cols.forEach(col => {
                col = col.split(':')
                if (col.length === 1) player[row] = parseFloat(col[0])
                else player[row][col[0].toLowerCase()] = parseFloat(col[1])
            })
        } while (true)
/*
        while (r--) {
            ln = c.lines[++c.i].trim()

            charIndex = ln.indexOf(":")
            row = ln.slice(0, charIndex).replace(/[\s\&]/g, "_").toLowerCase()
            col = ln.slice(charIndex + 1).trim().split(' ')
            player[row] = {}
            col.forEach(a => {
                a = a.split(":")
                player[row][a[0].toLowerCase()] = parseFloat(a[1])
            })
        }*/

        // Save player
        team.players.push(player)

        // Next player
        c.i++
    } while (c.lines[c.i] && c.lines[c.i][0] != '\r')

    // Save team
    data.teams[team.name] = team;
}
