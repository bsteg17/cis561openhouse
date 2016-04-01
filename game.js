var util = require("util"),
    io = require("socket.io");
    Player = require("./Player").Player;

var socket,
players;

function Game() {
    players = [];
    socket = io.listen(8000);
    setEventHandlers();
};

Game.prototype.setEventHandlers = function() {
    socket.sockets.on("connection", onSocketConnection);
};

Game.prototype.onSocketConnection = function(client) {
    util.log("New player has connected: "+client.id);
    client.on("disconnect", onClientDisconnect);
    client.on("new player", onNewPlayer);
    client.on("move player", onMovePlayer);
};

Game.prototype.onClientDisconnect = function() {
    util.log("Player has disconnected: "+this.id);
};

Game.prototype.onNewPlayer = function(user) {
    
};