http = require('http');
Game = require('./game.js');
express = require('express');
path = require('path');
bodyParser = require('body-parser');

app = new express();
server = http.createServer(app);
io = require('socket.io')(server);

app.use(express.static('public'));
app.use(bodyParser());

var PORT = 8080;

var players = {};
// var game = new Game();
io.on('connection', onConnection);

function onConnection(client) {
    setEventHandlers(client);
    players[client.id] = {};
    console.log(client.id); //debug
    players[client.id]["session"] = client;
}

function setEventHandlers(client) {
    client.on('submitHandle', onSubmitHandle);
}

function onSubmitHandle(handle) {
    players["/#"+handle.playerID]["handle"] = handle.handle;
    console.log(players); //debug
    if (Object.keys(players).length == 2) {
        console.log("two players"); //debug
        client.emit('askForChoice', profiles);
    }
}

app.get('/game', function(req, res) {
    // game.addPlayer(handle);
    // if (game.players.length == 2) {
    //     game.start();
    // }
    res.sendFile(path.join(__dirname + '/views/game.html'));
});

server.listen(PORT, function() {
    console.log("listening"); //debug
});