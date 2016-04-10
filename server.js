http = require('http');
Game = require('./game.js');
express = require('express');
path = require('path');
bodyParser = require('body-parser');
fs = require('fs');
Helpers = new require('./helpers/helpers.js');

app = new express();
server = http.createServer(app);
io = require('socket.io')(server);

app.use(express.static('public'));
app.use(bodyParser());

var PORT = 8080;

var players = {},
    playerKeys,
    profiles,
    currentTurn;

app.get('/game', function(req, res) {
    res.sendFile(path.join(__dirname + '/views/game.html'));
});

server.listen(PORT, function() {
    console.log("listening"); //debug
});

io.on('connection', onConnection);

function onConnection(client) {
    setEventHandlers(client);
    players[client.id] = {};
    players[client.id]["session"] = client;
}

function setEventHandlers(client) {
    client.on('submitHandle', onSubmitHandle);
    client.on('choice', onChoice);
}

function onSubmitHandle(handle) {
    players["/#"+handle.playerID]["handle"] = handle.handle;
    getTwitterProfile("/#"+handle.playerID, readyToChoose);
}

function getTwitterProfile(playerID, callback) {
    following = JSON.parse(fs.readFileSync('players.json'));
    players[playerID]["twitterProfile"] = {following:following};
    if (Helpers.allPlayersHaveAttr(players, 'twitterProfile')) {
        callback();
    }
}

function readyToChoose() {
    profiles = getMutuallyFollowing();
    console.log(profiles.length); //debug
    io.sockets.emit('askForChoice', profiles);
}

function getMutuallyFollowing() {
    playersValues = Helpers.getObjectValues(players);
    p1 = playersValues[0];
    p2 = playersValues[1];
    overlap = Helpers.intersectSafe(p1['twitterProfile']['following'], p2['twitterProfile']['following']);
    if (overlap.length < 24) {return [];}
    chosenProfiles = [];
    for (i = 0; i < 24; i++) {
        randomProfileIndex = Math.floor(Math.random() * overlap.length);
        chosenProfiles.push(overlap[randomProfileIndex]);
        overlap.splice(randomProfileIndex, 1);
    }
    return chosenProfiles;
}

function onChoice(choice) {
    console.log(choice);
    players['/#'+choice.playerID]["choice"] = choice.screen_name;
    if (Helpers.allPlayersHaveAttr(players, 'choice')) {
        beginFirstTurn();
    }
}

function beginFirstTurn() {
    determineFirstTurn();
    players[playerKeys[currentTurn]].session.emit('yourTurn');
    //client1.broadcast.emit emits to every client except for client1
    players[playerKeys[currentTurn]].session.broadcast.emit('opponentsTurn');
}

function determineFirstTurn() {
    playerKeys = Helpers.getObjectKeys(players);
    if(Math.random() < .5) {
        currentTurn = 0;
    } else {
        currentTurn = 1;
    }
}