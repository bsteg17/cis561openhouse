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

var game = new Game(io);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/views/sign_in.html'));
});

app.post('/game', function(req, res) {
    // handle = req.body.handle;
    // game.addPlayer(handle);
    // if (game.players.length == 2) {
    //     game.start();
    // }
    game.start();
    res.sendFile(path.join(__dirname + '/views/game.html'));
});

server.listen(PORT, function() {
    console.log("listening"); //debug
});