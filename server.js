http = require('http');
Twitter = require('twitter');
Game = require('./game.js');
secrets = require('./secrets.js');
express = require('express');
path = require('path');
bodyParser = require('body-parser');

app = new express();
server = http.createServer(app);

app.use("/public", express.static(path.join(__dirname, 'public')));
app.use(bodyParser());

var PORT = 8080;

var client = new Twitter({
  consumer_key: secrets.consumer_key,
  consumer_secret: secrets.consumer_secret,
  access_token_key: secrets.access_token_key,
  access_token_secret: secrets.access_token_secret
});

app.get('/', function(req, res) {
    console.log("here at /");
      res.sendFile(path.join(__dirname + '/views/sign_in.html'));
});

app.post('/game', function(req, res) {
    handle = req.body.handle;
});

server.listen(PORT, function() {
    console.log("listening");
});
 
// var params = {screen_name: 'sav_jac'};
// client.get('statuses/user_timeline', params, function(error, tweets, response){
//   if (!error) {
//     tweets.forEach(function(tweet) {
//         console.log(tweet.text);
//     });
//   } else {
//     console.log(error);
//   }
// });