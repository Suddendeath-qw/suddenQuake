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
var Player = /** @class */ (function () {
    function Player(name) {
        this.name = name;
        this.matches = 0;
    }
    Player.prototype.addMatchStats = function (stats) {
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
        var match = JSON.parse(content);
        data.matches.push(match);
    });
}
importJSON();
console.log(data.matches.length);
//
