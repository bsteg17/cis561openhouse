
var request = require('request');

function Game(io) {
    var io = io;
    players = [];
    profiles = [];
}

Game.prototype.addPlayer = function(user) {
    players.push(user);
    instagramAPICall('/users/therock', user.access_token, function(following) {
        console.log(following);
    });
};



Game.prototype.requestChoice = function() {
    io.emit()
}

Game.prototype.init = function() {
    
}

function getProfileSet() {
    
}

function intersect_safe(a, b)
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

function instagramAPICall(path, accessToken, callback) {
    if (path[0] == "/") { path = path.substring(1); }
    url = 'https://api.instagram.com/v1/'+path+'?access_token='+accessToken
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(JSON.parse(body));
        } else {
            console.log("STATUS CODE: "+response.statusCode+" ERROR: "+error);
        }
    });
}

module.exports = exports = Game;