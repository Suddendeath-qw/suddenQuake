"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var fs = require("fs");
// TODO
// Convert to flat instantly!
// One type for flatstats (not total and avg in same)
// One type that is combined (extends normal with average)
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
var emptyPlayerData = function () { return ({
    team: "",
    name: "",
    frags: 0,
    tk: 0,
    net: 0,
    eff: 0,
    wp: {},
    rl_skill: {},
    'armr&mhs': {},
    powerups: {},
    rl: { took: 0, killed: 0, dropped: 0 },
    lg: { took: 0, killed: 0, dropped: 0 },
    damage: {
        tkn: 0,
        gvn: 0
    },
    time: {},
    streaks: {
        frags: 0
    },
    spawnfrags: 0
}); };
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
    streaks_quadrun: 0
}); };
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
var PlayerStats = /** @class */ (function () {
    function PlayerStats(name) {
        this.name = name;
        this.matches = 0;
        this.maps = { dm2: 0, dm3: 0, e1m2: 0 };
        this.wins = 0;
        this.losses = 0;
        this.total = __assign({}, emptyPlayerData());
        this.avg = __assign({}, emptyPlayerData());
    }
    PlayerStats.prototype.addPlayerStats = function (stats, mapName, isWin) {
        // Make sure it's the correct player
        if (stats.name !== this.name)
            throw new Error("player name mismatch, got " + stats.name + " expected " + this.name);
        this.matches++;
        this.maps[mapName]++;
        if (isWin)
            this.wins++;
        if (!isWin)
            this.losses++;
        // If this is the first entry
        this.total = this.calcTotalStats(stats);
        this.avg = this.calcAverageStats(stats, mapName);
        //console.log(this.avg)
    };
    PlayerStats.prototype.calcTotalStats = function (stats) {
        var _this = this;
        var obj = __assign({}, this.total);
        // Root keys
        Object.keys(stats).forEach(function (key) {
            if (typeof stats[key] === "number") {
                obj[key] = _this.calcTotal(obj[key], stats[key]);
            }
            else if (typeof stats[key] === "object") {
                Object.keys(stats[key]).forEach(function (key2) {
                    obj[key][key2] = _this.calcTotal(obj[key][key2], stats[key][key2]);
                });
            }
        });
        return obj;
    };
    PlayerStats.prototype.calcAverageStats = function (stats, mapName) {
        var _this = this;
        var obj = __assign({}, this.avg);
        // Root keys
        Object.keys(stats).forEach(function (key) {
            if (typeof stats[key] === "number") {
                obj[key] = _this.calcAvg(obj[key], stats[key], _this.matches);
            }
            else if (typeof stats[key] === "object") {
                Object.keys(stats[key]).forEach(function (key2) {
                    var mapItem = mapItems.any.includes(itemFix(key2));
                    var mapsWithItem = mapsWith(key2);
                    //console.log(mapItem, key2, itemFix(key2), mapsWithItem)
                    // If it is not a map item
                    if (!mapItem) {
                        obj[key][key2] = _this.calcAvg(obj[key][key2], stats[key][key2], _this.matches);
                    }
                    // If it is a map item and the current map has it, calc new avg
                    else if (mapItem && mapsWithItem.includes(mapName)) {
                        // Sum all of the played matches on those maps with mapItem
                        var nMapsWithItem_1 = 0;
                        mapsWithItem.forEach(function (mName) { return nMapsWithItem_1 += _this.maps[mName]; });
                        obj[key][key2] = _this.calcAvg(obj[key][key2], stats[key][key2], nMapsWithItem_1);
                    }
                    else
                        return; // Don't count this towards average LG/Pent on DM2 for example
                });
            }
        });
        //console.log(obj)
        return obj;
    };
    PlayerStats.prototype.createFlatObject = function () {
    };
    PlayerStats.prototype.calcTotal = function (a, b) {
        if (typeof a !== "number")
            a = 0;
        return a + b;
    };
    PlayerStats.prototype.calcAvg = function (a, b, n) {
        if (typeof a !== "number")
            a = 0;
        return ((a * (n - 1)) + b) / n;
    };
    return PlayerStats;
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
var apa = new PlayerStats("rio");
var testPlayer = data.matches[0].teams["=s="].players[0];
var testPlayer2 = data.matches[1].teams["=s="].players[0];
var playerStats = {};
FILTER_PLAYERS.forEach(function (playerName) {
    playerStats[playerName] = new PlayerStats(playerName);
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
            var pl = playerStats[playerObj.name];
            pl.addPlayerStats(playerObj, match.map, isWin(match.teams, teamName));
        });
    });
});
//console.log("matches", playerStats["andeh"])
