"use strict";
exports.__esModule = true;
var fs = require("fs");
var data = {
    matches: []
};
var players = [
    "rio",
    "andeh",
    "lethalwiz",
    "goblin",
    "mOlle"
];
var Match = /** @class */ (function () {
    function Match(m) {
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
    return Match;
}());
var Player = /** @class */ (function () {
    function Player(name) {
        this.name = name;
        this.matches = 0;
    }
    Player.prototype.addPlayerStats = function (stats) {
        //
    };
    return Player;
}());
function isPlayer(player) {
    return players.includes(player);
}
function importJSON() {
    var dirname = "./json";
    var filenames = fs.readdirSync(dirname);
    filenames.forEach(function (filename) {
        var content = fs.readFileSync(dirname + "/" + filename, 'utf-8');
        var match = new Match(JSON.parse(content));
        console.log(match);
    });
}
importJSON();
console.log(data.matches.length);
//
