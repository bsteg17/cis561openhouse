http = require('http');
Game = require('./game.js');
express = require('express');
path = require('path');
bodyParser = require('body-parser');
fs = require('fs');
_ = require('underscore');
Helpers = new require('./helpers/helpers.js');

app = new express();
server = http.createServer(app);
io = require('socket.io')(server);

app.use(express.static('public'));
app.use(bodyParser());

round = 0;//debug

var PORT = 8080;

var twitter = new Twitter({
  consumer_key: secrets.consumer_key,
  consumer_secret: secrets.consumer_secret,
  access_token_key: secrets.access_token_key,
  access_token_secret: secrets.access_token_secret
});

var players = {},
    questions = [],
    playerKeys,
    profiles,
    currentTurn,
    currentQuestion;

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
    client.on('chatMessage', onChatMessage);
    client.on('askQuestion', onAskQuestion);
    client.on('replyWithAnswer', onReplyWithAnswer);
    client.on('guess', onGuess);
}

function onSubmitHandle(handle) {
    players["/#"+handle.playerID]["handle"] = handle.handle;
    getTwitterProfile("/#"+handle.playerID, readyToChoose);
}

function getTwitterProfile(playerID, callback) {
    // ifNotFollowingTooMany(players[playerID]["handle"], function() {
    //     getFollowing(players[playerID]["handle"], -1, [], function(err, following) {
            // if (err) {console.log(err);
            //     console.log("getTwitterProfile");}
            if (round == 0) {
                following = JSON.parse(fs.readFileSync('players1.json'));
                round++;
            } else {
                following = JSON.parse(fs.readFileSync('players2.json'));
            } //debug
            players[playerID]["twitterProfile"] = {following:following};
            if (Helpers.allPlayersHaveAttr(players, 'twitterProfile')) {
                callback();
            }
    //     });
    // });
}

function ifNotFollowingTooMany(handle, callback) {
    params = {screen_name:handle};
    twitter.get('users/show', params, function(error, user, response){
      if (!error) {
          if (user.friends_count < 1000) {
              callback();
          } else {
              console.log("sorry you're following too many people. you are too popular/desparate to play this game.");
          }
      } else {
          throw error
          console.log("line ~95");
      }
    });
}

function getFollowing(handle, cursor, following, callback) {
    var params = {screen_name: handle, cursor: cursor, count: 200};
    twitter.get('friends/list', params, function(error, followingBatch, response){
      if (!error) {
        followingBatch.users.forEach(function(user) {
            following.push(user);
        });
        cursor = followingBatch.next_cursor;
        if (cursor == 0) {
          callback(null, following);
        } else {
          getFollowing(handle, cursor, following, callback)
        }
      } else {
        callback(error, following);
      }
    });
}

function readyToChoose() {
    profiles = getMutuallyFollowing();
    if (profiles.length == 0) {console.log("Not following enough of the same people.");}
    io.sockets.emit('askForChoice', profiles);
}

function getMutuallyFollowing() {
    playersValues = Helpers.getObjectValues(players);
    p1 = playersValues[0];
    p2 = playersValues[1];
    console.log(p1['twitterProfile']['following']);
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
    Helpers.getObjectKeys(players).forEach(function(key) {
       players[key]['questions'] = []; 
    });
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

function startNextTurn() {
    currentTurn = (currentTurn + 1) % 2;
    players[playerKeys[currentTurn]].session.emit('yourTurn');
    //client1.broadcast.emit emits to every client except for client1
    players[playerKeys[currentTurn]].session.broadcast.emit('opponentsTurn');
}

function onChatMessage(message) {
    handle = players['/#'+message.playerID]['handle'];
    message = {text:message.text, handle:handle}
    console.log(message);
    io.sockets.emit('recieveMessage', message);
}

function onAskQuestion(question) {
    player = players['/#'+question.playerID];
    currentQuestion = {text:question.text, handle:player.handle}
    console.log(question);
    player['session'].emit('myQuestion', currentQuestion);
    player['session'].broadcast.emit('myOpponentsQuestion', currentQuestion);
}

function onReplyWithAnswer(answer) {
    currentQuestion['answer'] = answer;
    questions.push(currentQuestion);
    io.sockets.emit('addQuestionToLog', currentQuestion);
    startNextTurn();
}

function onGuess(guess) {
    player = players['/#'+guess.playerID];
    opponent = Helpers.getOpponent(players, guess.playerID);
    console.log(opponent); //debug
    if (guess.handle == opponent['choice']) {
        playerWins(player, opponent);
    } else {
        io.sockets.emit('addQuestionToLog', {text:'@'+guess.handle+'?', answer:'No'});
        startNextTurn();
    }
}

function playerWins(player, opponent) {
    player.session.emit('youWin', questions);
    opponent.session.emit('youLose', questions);
}