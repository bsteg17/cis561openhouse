
var request = require('request');
var Player = require('./player.js');
Twitter = require('twitter');
secrets = require('./secrets.js');
var fs = require('fs');

var twitter = new Twitter({
  consumer_key: secrets.consumer_key,
  consumer_secret: secrets.consumer_secret,
  access_token_key: secrets.access_token_key,
  access_token_secret: secrets.access_token_secret
});

function Game(io) {
    players = [];
    profiles = [];
    io = io;
}

Game.prototype.addPlayer = function(handle) {
    cursor = -1;
    following = [];
    ifNotFollowingTooMany(handle, function() {
        getFollowing(handle, cursor, following, function(error, following) {
            if (error) {console.log(error);}
            //console.log(following); //debug
            player = new Player(handle, following);
            players.push(player);
        });
    });
}

Game.prototype.start = function() {
    console.log('entered startGame');
    following = JSON.parse(fs.readFileSync('players.json'));
    player1 = new Player("stegtodiffer", following);
    player2 = new Player("antistegtodiffer", following);
    players.push(player1);
    players.push(player2);
    profiles = chooseProfiles(player1, player2);
    if (profiles.length != 0) {
        setEventHandlers();
    } else {
        console.log("you aren't following enough of the same people.");
        return;
    }
    
}

function setEventHandlers() {
    io.on('connection', onConnection);
    io.on('disconnection', onDisconnection);
    io.on('choice', onChoice);
}

function onConnection(client) {
    console.log("new connection: "+client.id); //debug
    players[players.length - 1].session = client;
    askForChoice(client);
}

function onDisconnection(client) {
    console.log("disconnection: "+client.id); //debug
}

function onChoice(choice) {
    console.log(choice);
}

function chooseProfiles(p1, p2) {
    overlap = intersectSafe(p1.following, p2.following);
    if (overlap.length < 24) {return [];}
    chosenProfiles = [];
    for (i = 0; i < 24; i++) {
        console.log(overlap.length); //debug
        randomProfileIndex = Math.floor(Math.random() * overlap.length)
        chosenProfiles.push(overlap[randomProfileIndex]);
        overlap.splice(randomProfileIndex, 1);
    }
    console.log("---------------------------");//debug
    for(i = 0; i < 24; i++) {
        console.log(chosenProfiles[i].screen_name); //debug
    }
    console.log("---------------------------");//debug
    return chosenProfiles;
}

function askForChoice(client) {
    client.emit('askForChoice', profiles);
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
          console.log(error);
      }
    });
}

function intersectSafe(a, b)
{
  var ai = 0, bi = 0;
  var result = [];

  while( ai < a.length && bi < b.length )
  {
     if      (a[ai] < b[bi] ){ ai++; }
     else if (a[ai] > b[bi] ){ bi++; }
     else /* they're equal */
     {
       result.push(a[ai]);
       ai++;
       bi++;
     }
  }

  return result;
}

module.exports = exports = Game;