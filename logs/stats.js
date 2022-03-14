"use strict";
exports.__esModule = true;
exports.MatchData = void 0;
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
var data = {
    matches: []
};
var FILTER_TEAMS = ["=s="];
var FILTER_MAPS = ["dm3", "dm2", "e1m2"];
var FILTER_PLAYERS = [
    "rio",
    "andeh",
    "lethalwiz",
    "goblin",
    "mOlle"
];
var defaultFlatPlayerStats = function () { return ({
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
    streaks_quadrun: 0
}); };
var mapItems = {
    any: ["quad", "pent", "ring", "ra", "ya", "mh", "rl", "lg", "gl", "sng", "ssg", "sg"],
    dm3: ["quad", "pent", "ring", "ra", "ya", "mh", "rl", "lg", "gl", "sng", "ssg", "sg"],
    dm2: ["quad", "ra", "ya", "mh", "rl", "gl", "ng", "ssg", "sg"],
    e1m2: ["quad", "ya", "ga", "mh", "rl", "gl", "sng", "ng", "ssg", "sg"]
};
function itemFix(itemName) {
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
        default:
            return itemName;
    }
}
function mapsWith(itemName) {
    var mapsWith = [];
    itemName = itemFix(itemName);
    if (mapItems.dm2.includes(itemName))
        mapsWith.push("dm2");
    if (mapItems.dm3.includes(itemName))
        mapsWith.push("dm3");
    if (mapItems.e1m2.includes(itemName))
        mapsWith.push("e1m2");
    return mapsWith;
}
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
        this.stats[mapName]++;
        this.stats[mapName + "_" + outcome]++;
        // Flat stats 'frags', 'net', 'tk', 'eff', 'spawnfrags'
        Object.keys(data).forEach(function (key) {
            var entry = data[key];
            if (typeof entry === "number")
                return _this.addEntry([key], entry);
            else if (typeof entry === "object") {
                if (data.name == "andeh" && key == "armrmhs") {
                    //console.log(entry)
                }
                Object.keys(entry).forEach(function (key2) {
                    _this.addEntry([key, key2], entry[key2]);
                });
            }
        });
    };
    PlayerStatsTotal.prototype.addEntry = function (key, entry) {
        var k = key.join('_');
        this.stats[k] += entry;
    };
    return PlayerStatsTotal;
}());
function importJSON() {
    var dirname = "./json";
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
var testPlayer = data.matches[0].teams["=s="].players[0];
var testPlayer2 = data.matches[1].teams["=s="].players[0];
var playerStats = {};
FILTER_PLAYERS.forEach(function (playerName) {
    playerStats[playerName] = new PlayerStatsTotal(defaultFlatPlayerStats());
});
// loop through the matches and filter out player stats
data.matches.forEach(function (match) {
    if (!FILTER_MAPS.includes(match.map))
        return;
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
console.log("matches", playerStats["andeh"]);
