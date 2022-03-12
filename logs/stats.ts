import * as fs from "fs"
import {PlayerData, MatchDataObj, TopScorerStats, TopScorerEntry, TeamDataObj, TeamData} from "./logtypes"

// TODO
// Convert to flat instantly!
// One type for flatstats (not total and avg in same)
// One type that is combined (extends normal with average)

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

interface FlatPlayerStats {
    // Metadata
    team: string
    name: string

    // Matches
    matches: number
    win: number
    loss: number
    dm2: number
    dm2_win: number
    dm2_loss: number
    dm3: number
    dm3_win: number
    dm3_loss: number
    e1m2: number
    e1m2_win: number
    e1m2_loss: number

    // Flat stats
    frags: number
    net: number
    tk: number
    eff: number
    spawnfrags: number

    wp_lg: number
    wp_rl: number
    wp_gl: number
    wp_ssg: number
    wp_sg: number

    rlskill_ad: number
    rlskill_dh: number

    powerups_q: number
    powerups_p: number
    powerups_r: number

    rl_took: number
    rl_killed: number
    rl_dropped: number
    rl_xfer: number

    lg_took: number
    lg_killed: number
    lg_dropped: number
    lg_xfer: number

    damage_tkn: number
    damage_gvn: number
    damage_ewep: number
    damage_self: number
    damage_todie: number

    time_quad: number
    streaks_frags: number
    streaks_quadrun: number
}



const defaultFlatPlayerStats = ():FlatPlayerStats => ({
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
    wp_ssg: 0,
    wp_sg: 0,

    rlskill_ad: 0,
    rlskill_dh: 0,

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
    damage_self: 0,
    damage_todie: 0,

    time_quad: 0,
    streaks_frags: 0,
    streaks_quadrun: 0,
})


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

interface PlayerStatsFlat {
    name: string
    matches: number

    // Total
    totalFrags: number
    totalTk: number

}

interface MapStats {
    dm2: number
    dm3: number
    e1m2: number
}

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


class PlayerStats {
    name: string
    matches: number
    maps: MapStats
    wins: number
    losses: number
    total: PlayerData
    avg: PlayerData

    constructor (name:string) {
        this.name = name
        this.matches = 0
        this.maps = { dm2: 0, dm3: 0, e1m2: 0 }
        this.wins = 0
        this.losses = 0
        this.total = {...emptyPlayerData()}
        this.avg = {...emptyPlayerData()}
    }

    addPlayerStats (stats:PlayerData, mapName:string, isWin:boolean) {
        // Make sure it's the correct player
        if (stats.name !== this.name)  throw new Error("player name mismatch, got " + stats.name + " expected " + this.name)

        this.matches++
        this.maps[mapName]++
        if (isWin) this.wins++
        if (!isWin) this.losses++

        // If this is the first entry
        this.total = this.calcTotalStats(stats) 
        this.avg = this.calcAverageStats(stats, mapName)
        //console.log(this.avg)
    }

    private calcTotalStats(stats:PlayerData):PlayerData {
        let obj = {...this.total}

        // Root keys
        Object.keys(stats).forEach(key => {
            if (typeof stats[key] === "number") {
                obj[key] = this.calcTotal(obj[key], stats[key])
            }
            else if (typeof stats[key] === "object") {
                Object.keys(stats[key]).forEach(key2 => {
                    obj[key][key2] = this.calcTotal(obj[key][key2], stats[key][key2])
                })
            }
        })

        return obj;

    }

    private calcAverageStats(stats:PlayerData, mapName:string):PlayerData {
        let obj = {...this.avg}

        // Root keys
        Object.keys(stats).forEach(key => {
            if (typeof stats[key] === "number") {
                obj[key] = this.calcAvg(obj[key], stats[key], this.matches)
            }
            else if (typeof stats[key] === "object") {
                Object.keys(stats[key]).forEach(key2 => {
                    let mapItem = mapItems.any.includes(itemFix(key2))
                    let mapsWithItem = mapsWith(key2);

                    //console.log(mapItem, key2, itemFix(key2), mapsWithItem)
    
                    // If it is not a map item
                    if (!mapItem) {
                        obj[key][key2] = this.calcAvg(obj[key][key2], stats[key][key2], this.matches)
                    }
                    // If it is a map item and the current map has it, calc new avg
                    else if (mapItem && mapsWithItem.includes(mapName)) {
                        // Sum all of the played matches on those maps with mapItem
                        let nMapsWithItem = 0
                        mapsWithItem.forEach(mName => nMapsWithItem += this.maps[mName])
                        obj[key][key2] = this.calcAvg(obj[key][key2], stats[key][key2], nMapsWithItem)
                    }
                    else return // Don't count this towards average LG/Pent on DM2 for example
                })
            }
        })

        //console.log(obj)

        return obj;
    }

    createFlatObject () {

    }

    private calcTotal (a:number, b:number):number {
        if (typeof a !== "number") a = 0
        return a + b;
    }

    private calcAvg (a:number, b:number, n:number):number {
        if (typeof a !== "number") a = 0

        return ((a * (n - 1)) + b) / n
    }
}

function importJSON () {
    const dirname = "./json";
    const filenames = fs.readdirSync(dirname)
    filenames.forEach(function(filename) {
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

var apa = new PlayerStats("rio")
var testPlayer = data.matches[0].teams["=s="].players[0]
var testPlayer2 = data.matches[1].teams["=s="].players[0]

let playerStats = {};
FILTER_PLAYERS.forEach(playerName => {
    playerStats[playerName] = new PlayerStats(playerName)
})


// loop through the matches and filter out player stats
data.matches.forEach(match => {
    if (!FILTER_MAPS.includes(match.map)) return;

    Object.keys(match.teams).forEach(teamName => {
        if (!FILTER_TEAMS.includes(teamName)) return;
        const team = match.teams[teamName]

        team.players.forEach(playerObj => {
            let pl = playerStats[playerObj.name]
            pl.addPlayerStats(playerObj, match.map, isWin(match.teams, teamName))
        })
    })

})
//console.log("matches", playerStats["andeh"])
