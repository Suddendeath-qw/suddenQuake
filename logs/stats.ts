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

class Player {
    name: string
    matches: number
    constructor (name) {
        this.name = name
        this.matches = 0
    }

    addMatchStats (stats) {
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