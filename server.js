http = require('http');
Game = require('./game.js');
express = require('express');
path = require('path');
bodyParser = require('body-parser');

app = new express();
server = http.createServer(app);

app.use("/public", express.static(path.join(__dirname, 'public')));
app.use(bodyParser());

var PORT = 8080;

var game = new Game();

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/views/sign_in.html'));
});

app.post('/game', function(req, res) {
    handle = req.body.handle;
    game.addPlayer(handle);
    if (game.players.length == 2) {
        game.start();
    }
});

server.listen(PORT, function() {
    console.log("listening"); //debug
});