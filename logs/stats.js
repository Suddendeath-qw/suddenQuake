"use strict";
exports.__esModule = true;
exports.MatchData = void 0;
var path = require("path");
var clr = require("ansi-colors");
var rows_1 = require("./rows");
var fs = require("fs");
// TODO
// Convert to flat instantly!
// One type for flatstats (not total and avg in same)
// One type that is combined (extends normal with average)
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
var FILTER_TEAMS = ["-s-"];
var FILTER_MAPS = ["dm3", "dm2", "e1m2"];
var FILTER_PLAYERS = [
    "bps",
    "carapace",
    "ganon",
    "rst"
];
var FIX_PLAYERS = {
    // Div 1
    "5Haka": "Shaka",
    "sHaka": "Shaka",
    // Div2
    "Wimdowlicker": "wim",
    "w!mpansee": "wim",
    "Wimensrights": "wim",
    "Wimposter": "wim",
    "Wimpanion": "wim",
    "hangtime.ua": "hangtime",
    // Div 3
    "(1)k4t": "k4t",
    "viag.": "viag",
    "hestmox": "hemostx"
};
var defaultFlatPlayerStats = function () { return ({
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
    t_deaths: 0,
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
    t_rl_kdx: 0,
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
    a_deaths: 0,
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
    a_rl_kdx: 0,
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
    b_frags: 0,
    b_deaths: 0,
    b_streaks_frags: 0,
    b_streaks_quadrun: 0
}); };
function isWin(teams, playerTeam) {
    var teamArr = [];
    Object.keys(teams).forEach(function (teamName) {
        teamArr.push(teams[teamName]);
    });
    teamArr.sort(function (a, b) { return (a.frags < b.frags) ? 1 : -1; });
    return playerTeam === teamArr[0].name;
}
var PlayerStatsTotal = /** @class */ (function () {
    function PlayerStatsTotal(stats) {
        this.stats = stats;
    }
    PlayerStatsTotal.prototype.addFromPlayerData = function (data, mapName, isWin) {
        var _this = this;
        // Metadata
        this.stats.team = data.team;
        this.stats.name = data.name;
        // Matches
        var outcome = isWin ? "win" : "loss";
        this.stats.matches++;
        this.stats[outcome]++;
        this.stats.wl = this.stats.win / this.stats.matches;
        this.stats[mapName]++;
        this.stats[mapName + "_" + outcome]++;
        this.stats[mapName + "_wl"] = this.stats[mapName + "_win"] / this.stats[mapName];
        // Flat stats 'frags', 'net', 'tk', 'eff', 'spawnfrags'
        Object.keys(data)
            .filter(function (key) { return typeof data[key] === "number"; })
            .forEach(function (key) { return _this.addEntries([key], data[key]); });
        // category: {key: value}
        // Map-specific categories
        // rl: {took: 8, killed 5, dropped: 2, xfer: 1}
        // lg: {took: 0, killed: 0, dropped: 0, xfer: 0}
        var itemCategories = Object.keys(data)
            .filter(function (key) { return typeof data[key] === "object"; })
            .filter(function (cat) { return _this.isMapSpecificItem(cat); })
            .filter(function (cat) { return _this.isItemOnMap(cat, mapName); });
        itemCategories.forEach(function (cat) {
            var category = data[cat];
            Object.keys(category)
                .forEach(function (key) { return _this.addEntries([cat, key], data[cat][key], cat); });
        });
        // TODO Streaks instead of total, best?
        // category: {key: value}
        // non map-specific categories
        // Have map-specific items as keys
        // wp: {rl: 27, ....etc}
        var categories = Object.keys(data)
            .filter(function (key) { return typeof data[key] === "object"; })
            .filter(function (cat) { return !_this.isMapSpecificItem(cat); });
        categories.forEach(function (cat) {
            var category = data[cat];
            // Map-specfic keys
            var mapItemKeys = Object.keys(category)
                .filter(function (key) { return _this.isMapSpecificItem(key); })
                .filter(function (key) { return _this.isItemOnMap(key, mapName); });
            mapItemKeys.forEach(function (key) { return _this.addEntries([cat, key], category[key], key); });
            // Non-map-specific keys
            var nonMapItemKeys = Object.keys(category)
                .filter(function (key) { return !_this.isMapSpecificItem(key); });
            nonMapItemKeys.forEach(function (key) { return _this.addEntries([cat, key], category[key]); });
        });
    };
    PlayerStatsTotal.prototype.addEntries = function (keys, entry, item) {
        if (entry === 99999)
            return; // invalid data
        item = this.itemFix(item);
        var nMatches = item ? this.getMatchesWithItem(item) : this.stats.matches;
        this.addTotal(keys, entry);
        this.addBest(keys, entry);
        this.addAvg(keys, entry, nMatches);
    };
    PlayerStatsTotal.prototype.addTopAward = function (key) {
        this.stats["t_top_" + key]++;
    };
    PlayerStatsTotal.prototype.addTotal = function (keys, entry) {
        var k = "t_" + keys.join('_');
        this.stats[k] += entry;
    };
    PlayerStatsTotal.prototype.addAvg = function (keys, entry, nMatches) {
        var k = "a_" + keys.join('_');
        this.stats[k] = ((this.stats[k] * (nMatches - 1)) + entry) / nMatches;
    };
    PlayerStatsTotal.prototype.addBest = function (keys, entry) {
        var k = "b_" + keys.join('_');
        if (!this.stats.hasOwnProperty(k))
            return;
        this.stats[k] = this.stats[k] < entry ? entry : this.stats[k];
    };
    PlayerStatsTotal.prototype.isMapSpecificItem = function (item) {
        item = this.itemFix(item);
        var items = ["quad", "pent", "ring", "ra", "ya", "ga", "mh", "rl", "lg", "gl", "sng", "ssg"];
        return items.includes(item);
    };
    PlayerStatsTotal.prototype.getMatchesWithItem = function (item) {
        item = this.itemFix(item);
        var nMaps = 0;
        if (this.isMapSpecificItem(item)) {
            if (this.isItemOnMap(item, "dm2"))
                nMaps += this.stats.dm2;
            if (this.isItemOnMap(item, "dm3"))
                nMaps += this.stats.dm3;
            if (this.isItemOnMap(item, "e1m2"))
                nMaps += this.stats.e1m2;
        }
        else {
            nMaps = this.stats.matches;
        }
        return nMaps;
    };
    PlayerStatsTotal.prototype.isItemOnMap = function (item, mapName) {
        var mapItems = {
            dm3: ["quad", "pent", "ring", "ra", "ya", "mh", "rl", "lg", "gl", "sng", "ssg"],
            dm2: ["quad", "ra", "ya", "mh", "rl", "gl", "ng", "ssg"],
            e1m2: ["quad", "ya", "ga", "mh", "rl", "gl", "sng", "ng", "ssg"],
            schloss: ["quad", "pent", "ring", "ra", "ya", "mh", "rl", "gl", "sng", "ssg"],
            obsidan: ["quad", "pent", "ya", "ga", "mh", "rl", "gl", "sng", "ssg"]
        };
        return mapItems[mapName] && mapItems[mapName].includes(this.itemFix(item));
    };
    PlayerStatsTotal.prototype.itemFix = function (itemName) {
        switch (itemName) {
            case "quad":
            case "quadrun":
            case "q":
                return "quad";
            case "pent":
            case "p":
                return "pent";
            case "ring":
            case "r":
                return "ring";
            case "rlskill":
            case "rl":
                return "rl";
            default:
                return itemName;
        }
    };
    return PlayerStatsTotal;
}());
//console.log(rows)
//console.log("matches", playerStats["andeh"])
/*
 * ====================================================================
 *
 * Functions
 *
 * ====================================================================
 */
function Stats_ImportFile(fpath, matches) {
    var fileInfo = path.parse(fpath);
    console.log("  →", clr.green("importing stats ".concat(fileInfo.name, ".json")));
    var content = fs.readFileSync(fpath, 'utf-8');
    var match = new MatchData(JSON.parse(content));
    matches.push(match);
    //console.log(data)
}
function Stats_ImportFiles(fpath, matches) {
    var filenames = fs.readdirSync(fpath);
    filenames.forEach(function (filename) {
        Stats_ImportFile(fpath + "/" + filename, matches);
    });
}
function Stats_ParseMatches(playerStats, matches) {
    // loop through the matches and filter out player stats
    matches.forEach(function (match) {
        if (!FILTER_MAPS.includes(match.map))
            return;
        // Players
        Object.keys(match.teams).forEach(function (teamName) {
            //if (!FILTER_TEAMS.includes(teamName)) return;
            var team = match.teams[teamName];
            team.players.forEach(function (playerObj, pi) {
                var pName = playerObj.name;
                // Fix the player name for some players who can't decide on how to spell their name...
                if (FIX_PLAYERS.hasOwnProperty(pName))
                    pName = FIX_PLAYERS[pName];
                //if (!FILTER_PLAYERS.includes(pName) return;
                if (!playerStats.hasOwnProperty(pName)) {
                    //console.log("     ", clr.gray(`adding player: ${teamName} ${pName}`))    
                    playerStats[pName] = new PlayerStatsTotal(defaultFlatPlayerStats());
                }
                playerStats[pName].addFromPlayerData(playerObj, match.map, isWin(match.teams, teamName));
            });
        });
        // Top scores
        Object.keys(match.top).forEach(function (award) {
            match.top[award].forEach(function (receiver) {
                var pName = receiver.name;
                // Fix the player name for some players who can't decide on how to spell their name...
                if (FIX_PLAYERS.hasOwnProperty(pName))
                    pName = FIX_PLAYERS[pName];
                //if (!FILTER_PLAYERS.includes(pname)) return;
                //console.log(playerStats["rio"], receiver)
                playerStats[pName].addTopAward(award);
            });
        });
    });
}
function Stats_PrettifyForExcel(playerStats, rows) {
    var stats = {};
    Object.keys(rows).map(function (key) {
        var obj = {};
        var prettyKey = rows[key];
        Object.keys(playerStats).forEach(function (pName) {
            var value = playerStats[pName].stats[key];
            value = Number(value) && value % 1 !== 0 ? value.toFixed(2) : value;
            obj[pName] = parseFloat(value);
        });
        stats[prettyKey] = obj;
    });
    return stats;
}
function Stats_BestPlayers(playerStats, rows, n) {
    n = n || rows.length;
    var best = {};
    var stats = Stats_PrettifyForExcel(playerStats, rows);
    Object.keys(stats).forEach(function (statKey) {
        var players = stats[statKey];
        var playerScores = Object.keys(players)
            .map(function (name) {
            var value = players[name];
            return { name: name, value: value };
        })
            .sort(function (a, b) { return (a.value < b.value ? 1 : -1); })
            .slice(0, n);
        best[statKey] = playerScores;
    });
    return best;
}
function Stats_WriteDiscord(best) {
    var str = "";
    Object.keys(best).forEach(function (key) {
        var gold = best[key][0];
        var silver = best[key][1];
        var bronze = best[key][2];
        // Key
        str += "**".concat(key, "**:\n");
        // Medals
        str += ":first_place: ".concat(gold.name, " (").concat(gold.value, ")    ");
        str += ":second_place: ".concat(silver.name, " (").concat(silver.value, ")    ");
        str += ":third_place: ".concat(bronze.name, " (").concat(bronze.value, ")\n\n");
    });
    return str;
}
function main() {
    var matches;
    var players;
    try {
        if (!process.argv[2])
            throw new Error("usage: node stats.js <statsfile.json|jsondir>");
        var fpath = path.join(process.cwd(), process.argv[2]);
        if (!fs.existsSync(fpath))
            throw new Error("statsfile or directory not found");
        // Import json files
        matches = [];
        players = [];
        var fstat = fs.lstatSync(fpath);
        if (fstat.isDirectory())
            Stats_ImportFiles(fpath, matches);
        else if (fstat.isFile())
            Stats_ImportFile(fpath, matches);
        // Run the stats parsing
        Stats_ParseMatches(players, matches);
        var pnames = Object.keys(players).sort(function (a, b) {
            return a < b ? -1 : 1;
        });
        console.log(pnames);
        // Write JSON for Excel
        var stats = Stats_PrettifyForExcel(players, rows_1.statsRows);
        var best = Stats_BestPlayers(players, rows_1.bestRows);
        var md = Stats_WriteDiscord(best);
        //const best = 
        fs.writeFileSync("div2.json", JSON.stringify(best, null, 2));
        fs.writeFileSync("div2.md", md);
    }
    catch (e) {
        console.error(e);
    }
}
main();
