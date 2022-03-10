import * as fs from "fs"

let data = {
    matches: []
}

let players = [
    "rio",
    "andeh",
    "lethalwiz",
    "goblin",
    "mOlle"
]


interface PlayerStats {
    team: string,
    name: string,
    frags: number
    net: number,
    tk: number,
    eff: number,
    wp: {
        axe?: number,
        sg?: number,
        ssg?: number,
        ng?: number,
        sng?: number
        gl?: number,
        rl?: number,
        lg?: number
    },
    rl_skill: {
        ad?: number,
        dh?: number
    },
    armr_mhs: {
        ga?: number,
        ya?: number,
        ra?: number,
        mh?: number
    },
    powerups: {
        q?: number,
        p?: number,
        r?: number
    },
    rl?: {
        took: number,
        killed: number,
        dropped: number,
        xfer?: number
    },
    lg?: {
        took: number,
        killed: number,
        dropped: number,
        xfer?: number
    },
    damage: {
        tkn: number,
        gvn: number,
        ewep?: number,
        tm?: number,
        self?: number,
        todie?: number
    },
    time: {
        quad: number
    },
    streaks: {
        frags: number,
        quadrun: number
    },
    spawnfrag: number
}

interface TeamStats {
    name: string,
    frags: number,
    eff: number,
    players: Array<PlayerStats>
}

interface TeamStatsObj {
    [index: string]: TeamStats
}

interface TopScorerEntry {
    name: string,
    score: number
}

interface TopScorerStats {
    frags: Array<TopScorerEntry>,
    deaths: Array<TopScorerEntry>,
    friendkills: Array<TopScorerEntry>,
    efficiency: Array<TopScorerEntry>,
    fragstreak: Array<TopScorerEntry>,
    quadrun: Array<TopScorerEntry>,
    rl_killer: Array<TopScorerEntry>,
    boomsticker: Array<TopScorerEntry>,
    survivor: Array<TopScorerEntry>,
    annihilator: Array<TopScorerEntry>
}

interface MatchStats {
    id: string,
    date: string,
    mvd: string,
    map: string,
    teams: TeamStatsObj,
    top: TopScorerStats
}

class Match implements MatchStats {
    id = ""
    date = ""
    mvd = ""
    map = ""
    teams = null
    top = null

    constructor (m: MatchStats) {
        this.id = m.id
        this.date = m.date
        this.mvd = m.mvd
        this.map = m.map
        this.teams = m.teams
        this.top = m.top
    }
}



class Player {
    name: string
    matches: number
    constructor (name) {
        this.name = name
        this.matches = 0
    }

    addPlayerStats (stats) {
        //
    }
}

function isPlayer (player) {
    return players.includes(player)
}

function importJSON () {
    const dirname = "./json";
    const filenames = fs.readdirSync(dirname)
    filenames.forEach(function(filename) {
        const content = fs.readFileSync(dirname + "/" + filename, 'utf-8');
        const match = new Match(JSON.parse(content))
        console.log(match)
    });
}



importJSON();
console.log(data.matches.length)
//