import * as path from "path"
import * as clr from "ansi-colors"
import {PlayerData, FlatPlayerStats, TeamDataObj, MatchDataObj, TopScorerEntry} from "./logtypes"
import { bestRows, statsRows } from "./rows"
import * as fs from "fs"
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

const FILTER_TEAMS = ["-s-"]
const FILTER_MAPS = ["dm3", "dm2", "e1m2"]
const FILTER_PLAYERS  = [
    "bps",
    "carapace",
    "ganon",
    "rst"
]


const FIX_PLAYERS = {
    "5Haka": "Shaka",
    "sHaka": "Shaka"
}

const defaultFlatPlayerStats = ():FlatPlayerStats => ({
    // Metadata
    team: "",
    name: "",

    // Matches
    matches: 0,
    win: 0,
    loss: 0,
    wl: 0.5,
    dm2: 0,
    dm2_win: 0,
    dm2_loss: 0,
    dm2_wl: 0.5,
    dm3: 0,
    dm3_win: 0,
    dm3_loss: 0,
    dm3_wl: 0.5,
    e1m2: 0,
    e1m2_win: 0,
    e1m2_loss: 0,
    e1m2_wl: 0.5,

    // Total
    t_frags: 0,
    t_net: 0,
    t_tk: 0,
    t_eff: 0,
    t_spawnfrags: 0,

    t_top_frags: 0,
    t_top_deaths: 0,
    t_top_friendkills: 0,
    t_top_efficiency: 0,
    t_top_fragstreak: 0,
    t_top_quadrun: 0,
    t_top_rlkiller: 0,
    t_top_boomsticker: 0,
    t_top_survivor: 0,
    t_top_annihilator: 0,

    t_wp_lg: 0,
    t_wp_rl: 0,
    t_wp_gl: 0,
    t_wp_sng: 0,
    t_wp_ng: 0,
    t_wp_ssg: 0,
    t_wp_sg: 0,

    t_rlskill_ad: 0,
    t_rlskill_dh: 0,

    t_armrmhs_ga: 0,
    t_armrmhs_ya: 0,
    t_armrmhs_ra: 0,
    t_armrmhs_mh: 0,

    t_powerups_q: 0,
    t_powerups_p: 0,
    t_powerups_r: 0,

    t_rl_took: 0,
    t_rl_killed: 0,
    t_rl_dropped: 0,
    t_rl_xfer: 0,

    t_lg_took: 0,
    t_lg_killed: 0,
    t_lg_dropped: 0,
    t_lg_xfer: 0,

    t_damage_tkn: 0,
    t_damage_gvn: 0,
    t_damage_ewep: 0,
    t_damage_tm: 0,
    t_damage_self: 0,
    t_damage_todie: 0,

    t_time_quad: 0,
    t_streaks_frags: 0,
    t_streaks_quadrun: 0,

    // Avg
    a_frags: 0,
    a_net: 0,
    a_tk: 0,
    a_eff: 0,
    a_spawnfrags: 0,

    a_wp_lg: 0,
    a_wp_rl: 0,
    a_wp_gl: 0,
    a_wp_sng: 0,
    a_wp_ng: 0,
    a_wp_ssg: 0,
    a_wp_sg: 0,

    a_rlskill_ad: 0,
    a_rlskill_dh: 0,

    a_armrmhs_ga: 0,
    a_armrmhs_ya: 0,
    a_armrmhs_ra: 0,
    a_armrmhs_mh: 0,

    a_powerups_q: 0,
    a_powerups_p: 0,
    a_powerups_r: 0,

    a_rl_took: 0,
    a_rl_killed: 0,
    a_rl_dropped: 0,
    a_rl_xfer: 0,

    a_lg_took: 0,
    a_lg_killed: 0,
    a_lg_dropped: 0,
    a_lg_xfer: 0,

    a_damage_tkn: 0,
    a_damage_gvn: 0,
    a_damage_ewep: 0,
    a_damage_tm: 0,
    a_damage_self: 0,
    a_damage_todie: 0,

    a_time_quad: 0,
    a_streaks_frags: 0,
    a_streaks_quadrun: 0,

    // Best
    b_streaks_frags: 0,
    b_streaks_quadrun: 0
})


function isWin (teams:TeamDataObj, playerTeam:string):boolean {
    let teamArr = []
    Object.keys(teams).forEach(teamName => {
        teamArr.push(teams[teamName])
    })

    teamArr.sort((a, b) => (a.frags < b.frags) ? 1 : -1)

    return playerTeam === teamArr[0].name;
}

class PlayerStatsTotal  {
    stats: FlatPlayerStats

    constructor (stats:FlatPlayerStats) {
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
        this.stats.wl = this.stats.win / this.stats.matches;
        this.stats[mapName]++;
        this.stats[mapName+"_"+outcome]++;
        this.stats[mapName+"_wl"] = this.stats[mapName+"_win"] / this.stats[mapName];

        // Flat stats 'frags', 'net', 'tk', 'eff', 'spawnfrags'
        Object.keys(data)
              .filter(key => typeof data[key] === "number")
              .forEach(key => this.addEntries([key], data[key]));
 
        // category: {key: value}
        // Map-specific categories
        // rl: {took: 8, killed 5, dropped: 2, xfer: 1}
        // lg: {took: 0, killed: 0, dropped: 0, xfer: 0}
        const itemCategories = 
            Object.keys(data)
                  .filter(key => typeof data[key] === "object")
                  .filter(cat => this.isMapSpecificItem(cat))
                  .filter(cat => this.isItemOnMap(cat, mapName));

        itemCategories.forEach(cat => {
            const category = data[cat];
            Object.keys(category)
                  .forEach(key => this.addEntries([cat, key], data[cat][key], cat));
        });

        // TODO Streaks instead of total, best?

        // category: {key: value}
        // non map-specific categories
        // Have map-specific items as keys
        // wp: {rl: 27, ....etc}
        const categories = 
            Object.keys(data)
                  .filter(key => typeof data[key] === "object")
                  .filter(cat => !this.isMapSpecificItem(cat));


        categories.forEach(cat => {
            const category = data[cat];

            // Map specfic keys
            const itemKeys = 
                Object.keys(category)
                      .filter(key => this.isMapSpecificItem(key))
                      .filter(key => this.isItemOnMap(key, mapName));

            if (this.stats.name == "andeh") {
                //console.log(mapName, category, itemKeys)
                //console.log("-----------------------")
            }
            

            itemKeys.forEach(key => this.addEntries([cat, key], category[key], key));

            const keys = 
                Object.keys(category)
                      .filter(key => !this.isMapSpecificItem(key));

            keys.forEach(key => this.addEntries([cat, key], category[key]));

        });

    }

    private addEntries(keys:Array<string>, entry:number, item?:string) {
        item = this.itemFix(item);
        const nMatches = item ? this.getMatchesWithItem(item) : this.stats.matches;

        this.addTotal(keys, entry);
        this.addBest(keys, entry);
        

        this.addAvg(keys, entry, nMatches);
        
    }

    addTopAward (key:string) {
        this.stats["t_top_"+key]++;
    }

    private addTotal (keys:Array<string>, entry:number) {
        const k = "t_" + keys.join('_');
        this.stats[k] += entry;
    }

    private addAvg (keys:Array<string>, entry:number, nMatches:number) {
        const k = "a_" + keys.join('_');
        this.stats[k] = ((this.stats[k] * (nMatches - 1)) + entry) / nMatches;
    }

    private addBest (keys:Array<string>, entry:number) {
        const k = "b_" + keys.join('_');
        if (!this.stats.hasOwnProperty(k)) return;

        this.stats[k] = this.stats[k] < entry ? entry : this.stats[k]
    }



    private isMapSpecificItem (item:string) {
        item = this.itemFix(item);
        const items = ["quad", "pent", "ring", "ra", "ya", "ga", "mh", "rl", "lg", "gl", "sng", "ssg", "sg"];
        return items.includes(item);
    }

    private getMatchesWithItem (item:string) {
        item = this.itemFix(item);

        let nMaps = 0;

        if (this.isMapSpecificItem(item)) {
            if (this.isItemOnMap(item, "dm2")) nMaps += this.stats.dm2;
            if (this.isItemOnMap(item, "dm3")) nMaps += this.stats.dm3;
            if (this.isItemOnMap(item, "e1m2")) nMaps += this.stats.e1m2;
        } else {
            nMaps = this.stats.matches;
        }

        return nMaps;
    }

    private isItemOnMap (item:string, mapName:string) {
        const mapItems = {
            dm3: ["quad", "pent", "ring", "ra", "ya", "mh", "rl", "lg", "gl", "sng", "ssg", "sg"],
            dm2: ["quad", "ra", "ya", "mh", "rl", "gl", "ng", "ssg", "sg"],
            e1m2: ["quad", "ya", "ga", "mh", "rl", "gl", "sng", "ng", "ssg", "sg"]
        };

        return mapItems[mapName].includes(this.itemFix(item));
    }
    

    private addAvgMapItem (key:Array<string>, item:string, mapName:string, entry:number) {
        item = this.itemFix(item);

        const k = key.join('_')

        // Map items
        const mapItems = {
            dm3: ["quad", "pent", "ring", "ra", "ya", "mh", "rl", "lg", "gl", "sng", "ssg", "sg"],
            dm2: ["quad", "ra", "ya", "mh", "rl", "gl", "ng", "ssg", "sg"],
            e1m2: ["quad", "ya", "ga", "mh", "rl", "gl", "sng", "ng", "ssg", "sg"]
        };
        if (this.stats.name == "andeh" && k == "lg_took") {
            //console.log(item, k, mapName, entry)
        }

        // If it's a map item (LG/Pent) but played map does not include it (dm2), don't count this zero towards avg.
        if (!mapItems[mapName].includes(item)) return;

        let nMaps = 0;

        if (mapItems.dm2.includes(item)) nMaps += this.stats.dm2;
        if (mapItems.dm3.includes(item)) nMaps += this.stats.dm3;
        if (mapItems.e1m2.includes(item)) nMaps += this.stats.e1m2;

        this.addAvg(key, entry, nMaps);
    }

    private itemFix (itemName:string):string {
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
            case "rlskill":
            case "rl":
                return "rl"
            default:
                return itemName
        }
    }

}

//console.log(rows)


//console.log("matches", playerStats["andeh"])

/*
 * ====================================================================
 *
 * Functions
 *
 * ====================================================================
 */

function Stats_ImportFile (fpath:string, matches:Array<MatchData>) {
    const fileInfo = path.parse(fpath);
    console.log("  →", clr.green(`importing stats ${fileInfo.name}.json`))

    const content = fs.readFileSync(fpath, 'utf-8');
    const match = new MatchData(JSON.parse(content))
    matches.push(match);
    //console.log(data)
}

function Stats_ImportFiles (fpath:string, matches:Array<MatchData>) {
    const filenames = fs.readdirSync(fpath)
    filenames.forEach(function(filename) {
        Stats_ImportFile(fpath + "/" + filename, matches);
    });
}

function Stats_ParseMatches (playerStats:Array<PlayerStatsTotal>, matches:Array<MatchData>) {
// loop through the matches and filter out player stats
    matches.forEach(match => {
        if (!FILTER_MAPS.includes(match.map)) return;

        // Players
        Object.keys(match.teams).forEach(teamName => {
            //if (!FILTER_TEAMS.includes(teamName)) return;
            const team = match.teams[teamName]

            team.players.forEach((playerObj:PlayerData, pi) => {
                let pName = playerObj.name;
                
                // Fix the player name for some players who can't decide on how to spell their name...
                if (FIX_PLAYERS.hasOwnProperty(pName)) pName = FIX_PLAYERS[pName];

                //if (!FILTER_PLAYERS.includes(pName) return;
                if (!playerStats.hasOwnProperty(pName)) {
                    console.log("     ", clr.gray(`adding player: ${teamName} ${pName}`))    
                    playerStats[pName] = new PlayerStatsTotal(defaultFlatPlayerStats());
                }

                playerStats[pName].addFromPlayerData(playerObj, match.map, isWin(match.teams, teamName));
            });
        });

        // Top scores
        Object.keys(match.top).forEach(award => {
            match.top[award].forEach((receiver:TopScorerEntry) => {
                let pName = receiver.name;

                // Fix the player name for some players who can't decide on how to spell their name...
                if (FIX_PLAYERS.hasOwnProperty(pName)) pName = FIX_PLAYERS[pName];
                //if (!FILTER_PLAYERS.includes(pname)) return;

                
                //console.log(playerStats["rio"], receiver)
                playerStats[pName].addTopAward(award);
            });
        });

    });
}

function Stats_PrettifyForExcel (playerStats:Array<PlayerStatsTotal>, rows) {
    let stats = {};
    Object.keys(rows).map(key => {
        let obj = {};
        const prettyKey = rows[key];
        Object.keys(playerStats).forEach(pName => {
            let value = playerStats[pName].stats[key];
            value = Number(value) && value % 1 !== 0 ? value.toFixed(2) : value;
            obj[pName] = parseFloat(value);
        });

        stats[prettyKey] = obj;
    });

    return stats;
}

function Stats_BestPlayers (playerStats:Array<PlayerStatsTotal>, rows) {
    let best = {};
    const stats = Stats_PrettifyForExcel(playerStats, rows);
    Object.keys(stats).forEach(statKey => {
        let players = stats[statKey];
        let playerScores = Object.keys(players).map(name => {
            const value = players[name];
            return {name, value}
        }).sort((a, b)=> (a.value < b.value ? 1 : -1));

        best[statKey] = playerScores;
    });

    return best;
}


function main () {
    let matches:Array<MatchData>;
    let players:Array<PlayerStatsTotal>;
    

    try {
        if (!process.argv[2]) throw new Error("usage: node stats.js <statsfile.json|jsondir>")
        const fpath = path.join(process.cwd(), process.argv[2])
        if (!fs.existsSync(fpath)) throw new Error("statsfile or directory not found")
        
        // Import json files
        matches = [];
        players = [];
        const fstat = fs.lstatSync(fpath)
        if (fstat.isDirectory()) Stats_ImportFiles(fpath, matches)
        else if (fstat.isFile()) Stats_ImportFile(fpath, matches)

        // Run the stats parsing
        Stats_ParseMatches(players, matches);

        // Write JSON for Excel
        const stats = Stats_PrettifyForExcel(players, statsRows);
        const best = Stats_BestPlayers(players, bestRows);
        //const best = 
        fs.writeFileSync("best.json", JSON.stringify(best, null, 2))
        
    } catch (e) {
        console.error(e)
    }
}

main();