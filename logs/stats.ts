import * as fs from "fs"
import {PlayerData, PlayerStats, FlatPlayerStats, TeamDataObj, MatchDataObj} from "./logtypes"
import { throws } from "assert"
// TODO
// Convert to flat instantly!
// One type for flatstats (not total and avg in same)
// One type that is combined (extends normal with average)

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

let data = {
    matches: []
}



const FILTER_TEAMS = ["=s="]
const FILTER_MAPS = ["dm3", "dm2", "e1m2"]
const FILTER_PLAYERS  = [
    "rio",
    "andeh",
    "lethalwiz",
    "goblin",
    "mOlle"
]

const defaultFlatPlayerStats = ():PlayerStats => ({
    // Metadata
    team: "",
    name: "",

    // Matches
    matches: 0,
    win: 0,
    loss: 0,
    dm2: 0,
    dm2_win: 0,
    dm2_loss: 0,
    dm3: 0,
    dm3_win: 0,
    dm3_loss: 0,
    e1m2: 0,
    e1m2_win: 0,
    e1m2_loss: 0,

    // Flat stats
    frags: 0,
    net: 0,
    tk: 0,
    eff: 0,
    spawnfrags: 0,

    wp_lg: 0,
    wp_rl: 0,
    wp_gl: 0,
    wp_sng: 0,
    wp_ng: 0,
    wp_ssg: 0,
    wp_sg: 0,

    rlskill_ad: 0,
    rlskill_dh: 0,

    armrmhs_ga: 0,
    armrmhs_ya: 0,
    armrmhs_ra: 0,
    armrmhs_mh: 0,

    powerups_q: 0,
    powerups_p: 0,
    powerups_r: 0,

    rl_took: 0,
    rl_killed: 0,
    rl_dropped: 0,
    rl_xfer: 0,

    lg_took: 0,
    lg_killed: 0,
    lg_dropped: 0,
    lg_xfer: 0,

    damage_tkn: 0,
    damage_gvn: 0,
    damage_ewep: 0,
    damage_tm: 0,
    damage_self: 0,
    damage_todie: 0,

    time_quad: 0,
    streaks_frags: 0,
    streaks_quadrun: 0,
})

let mapItems = {
    any: ["quad", "pent", "ring", "ra", "ya", "mh", "rl", "lg", "gl", "sng", "ssg", "sg"],
    dm3: ["quad", "pent", "ring", "ra", "ya", "mh", "rl", "lg", "gl", "sng", "ssg", "sg"],
    dm2: ["quad", "ra", "ya", "mh", "rl", "gl", "ng", "ssg", "sg"],
    e1m2: ["quad", "ya", "ga", "mh", "rl", "gl", "sng", "ng", "ssg", "sg"]
}


function itemFix (itemName:string):string {
    switch (itemName) {
        case "quad":
        case "quadrun":
        case "q":
            return "quad"
        case "pent":
        case "p":
            return "pent"
        case "ring":
        case "r":
            return "ring"
        default:
            return itemName
    }
}

function mapsWith (itemName:string) {
    let mapsWith = []

    itemName = itemFix(itemName)

    if (mapItems.dm2.includes(itemName)) mapsWith.push("dm2")
    if (mapItems.dm3.includes(itemName)) mapsWith.push("dm3")
    if (mapItems.e1m2.includes(itemName)) mapsWith.push("e1m2")

    return mapsWith
}

function isWin (teams:TeamDataObj, playerTeam:string):boolean {
    let teamArr = []
    Object.keys(teams).forEach(teamName => {
        teamArr.push(teams[teamName])
    })

    teamArr.sort((a, b) => (a.frags < b.frags) ? 1 : -1)

    return playerTeam === teamArr[0].name;
}

class PlayerStatsTotal  {
    stats: PlayerStats

    constructor (stats:PlayerStats) {
        this.stats = stats;
    }

    addFromPlayerData (data:PlayerData, mapName:string, isWin:boolean) {
        // Metadata
        this.stats.team = data.team;
        this.stats.name = data.name;

        // Matches
        const outcome = isWin ? "win" : "loss";
        this.stats.matches++;
        this.stats[outcome]++;
        this.stats[mapName]++;
        this.stats[mapName+"_"+outcome]++;

        // Flat stats 'frags', 'net', 'tk', 'eff', 'spawnfrags'
        Object.keys(data).forEach(key => {
            const entry:any = data[key];
            if (typeof entry === "number") return this.addEntry([key], entry);
            else if (typeof entry === "object") {
                if (data.name == "andeh" && key == "armrmhs") {
                    //console.log(entry)
                }
                Object.keys(entry).forEach(key2 => {
                    this.addEntry([key, key2], entry[key2])
                })
            }

        });


    }

    private addEntry (key:Array<string>, entry:number|string) {
        const k = key.join('_');
        this.stats[k] += entry;
    }
    
}

function importJSON () {
    const dirname = "./json";
    const filenames = fs.readdirSync(dirname)
    filenames.forEach(filename => {
        const content = fs.readFileSync(dirname + "/" + filename, 'utf-8');
        const match = new MatchData(JSON.parse(content))
        data.matches.push(match)
    });
}//

// Import the data => data.matches
// Import the data => data.matches
// Import the data => data.matches
// Import the data => data.matches
// Import the data => data.matches
// Import the data => data.matches

importJSON();

var testPlayer = data.matches[0].teams["=s="].players[0]
var testPlayer2 = data.matches[1].teams["=s="].players[0]

let playerStats = {};
FILTER_PLAYERS.forEach(playerName => {
    playerStats[playerName] = new PlayerStatsTotal(defaultFlatPlayerStats())
})


// loop through the matches and filter out player stats
data.matches.forEach(match => {
    if (!FILTER_MAPS.includes(match.map)) return;

    Object.keys(match.teams).forEach(teamName => {
        if (!FILTER_TEAMS.includes(teamName)) return;
        const team = match.teams[teamName]

        team.players.forEach((playerObj:PlayerData) => {
            
            if (!FILTER_PLAYERS.includes(playerObj.name)) return;
            let pl = playerStats[playerObj.name]
            pl.addFromPlayerData(playerObj, match.map, isWin(match.teams, teamName))
        })
    })

})

console.log("matches", playerStats["andeh"])
