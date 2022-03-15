"use strict";
exports.__esModule = true;
exports.MatchData = void 0;
var fs = require("fs");
var rows = require("./rows.json");
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
var data = {
    matches: []
};
var FILTER_TEAMS = ["-s-"];
var FILTER_MAPS = ["dm3", "dm2", "e1m2"];
var FILTER_PLAYERS = [
    "bps",
    "carapace",
    "ganon",
    "rst"
];
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
            // Map specfic keys
            var itemKeys = Object.keys(category)
                .filter(function (key) { return _this.isMapSpecificItem(key); })
                .filter(function (key) { return _this.isItemOnMap(key, mapName); });
            if (_this.stats.name == "andeh") {
                //console.log(mapName, category, itemKeys)
                //console.log("-----------------------")
            }
            itemKeys.forEach(function (key) { return _this.addEntries([cat, key], category[key], key); });
            var keys = Object.keys(category)
                .filter(function (key) { return !_this.isMapSpecificItem(key); });
            keys.forEach(function (key) { return _this.addEntries([cat, key], category[key]); });
        });
    };
    PlayerStatsTotal.prototype.addEntries = function (keys, entry, item) {
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
        var items = ["quad", "pent", "ring", "ra", "ya", "ga", "mh", "rl", "lg", "gl", "sng", "ssg", "sg"];
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
            dm3: ["quad", "pent", "ring", "ra", "ya", "mh", "rl", "lg", "gl", "sng", "ssg", "sg"],
            dm2: ["quad", "ra", "ya", "mh", "rl", "gl", "ng", "ssg", "sg"],
            e1m2: ["quad", "ya", "ga", "mh", "rl", "gl", "sng", "ng", "ssg", "sg"]
        };
        return mapItems[mapName].includes(this.itemFix(item));
    };
    PlayerStatsTotal.prototype.addAvgMapItem = function (key, item, mapName, entry) {
        item = this.itemFix(item);
        var k = key.join('_');
        // Map items
        var mapItems = {
            dm3: ["quad", "pent", "ring", "ra", "ya", "mh", "rl", "lg", "gl", "sng", "ssg", "sg"],
            dm2: ["quad", "ra", "ya", "mh", "rl", "gl", "ng", "ssg", "sg"],
            e1m2: ["quad", "ya", "ga", "mh", "rl", "gl", "sng", "ng", "ssg", "sg"]
        };
        if (this.stats.name == "andeh" && k == "lg_took") {
            //console.log(item, k, mapName, entry)
        }
        // If it's a map item (LG/Pent) but played map does not include it (dm2), don't count this zero towards avg.
        if (!mapItems[mapName].includes(item))
            return;
        var nMaps = 0;
        if (mapItems.dm2.includes(item))
            nMaps += this.stats.dm2;
        if (mapItems.dm3.includes(item))
            nMaps += this.stats.dm3;
        if (mapItems.e1m2.includes(item))
            nMaps += this.stats.e1m2;
        this.addAvg(key, entry, nMaps);
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
function importJSON() {
    var dirname = "./s1json";
    var filenames = fs.readdirSync(dirname);
    filenames.forEach(function (filename) {
        var content = fs.readFileSync(dirname + "/" + filename, 'utf-8');
        var match = new MatchData(JSON.parse(content));
        data.matches.push(match);
    });
} //
// Import the data => data.matches
// Import the data => data.matches
// Import the data => data.matches
// Import the data => data.matches
// Import the data => data.matches
// Import the data => data.matches
importJSON();
var playerStats = {};
FILTER_PLAYERS.forEach(function (playerName) {
    playerStats[playerName] = new PlayerStatsTotal(defaultFlatPlayerStats());
});
// loop through the matches and filter out player stats
data.matches.forEach(function (match) {
    if (!FILTER_MAPS.includes(match.map))
        return;
    // Top scores
    Object.keys(match.top).forEach(function (award) {
        match.top[award].forEach(function (receiver) {
            if (!FILTER_PLAYERS.includes(receiver.name))
                return;
            playerStats[receiver.name].addTopAward(award);
        });
    });
    Object.keys(match.teams).forEach(function (teamName) {
        if (!FILTER_TEAMS.includes(teamName))
            return;
        var team = match.teams[teamName];
        team.players.forEach(function (playerObj) {
            if (!FILTER_PLAYERS.includes(playerObj.name))
                return;
            var pl = playerStats[playerObj.name];
            pl.addFromPlayerData(playerObj, match.map, isWin(match.teams, teamName));
        });
    });
});
// Write flat json for =s= players
var stats = {};
Object.keys(rows).map(function (key) {
    var obj = {};
    var prettyKey = rows[key];
    Object.keys(playerStats).forEach(function (pName) {
        var value = playerStats[pName].stats[key];
        value = Number(value) && value % 1 !== 0 ? value.toFixed(2) : value;
        obj[pName] = value;
    });
    stats[prettyKey] = obj;
});
//console.log(rows)
fs.writeFileSync("janne_s1.json", JSON.stringify(stats, null, 2));
//console.log("matches", playerStats["andeh"])
