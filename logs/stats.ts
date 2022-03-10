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
        const match = JSON.parse(content)
        data.matches.push(match);
    });
}

importJSON();
console.log(data.matches.length)
//