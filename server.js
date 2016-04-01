var http = require('http');
var express = require('express');
var api = require('instagram-node').instagram();
var secrets = require('./secrets.js');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var path = require('path');

CLIENT_ID = 'c0e99f553a0a4a86b026b6923d4e35ef';
CLIENT_SECRET = secrets.client_secret;
PORT = 8000;
DOMAIN = 'http://localhost:'+PORT+'/';

app.use(express.static('public'));
 
api.use({
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET
});
 
var redirect_uri = 'http://localhost:8000/game';
 
exports.authorize_user = function(req, res) {
  res.redirect(api.get_authorization_url(redirect_uri));
};
 
exports.handleauth = function(req, res) {
  api.authorize_user(req.query.code, redirect_uri, function(err, user) {
    if (err) {
      console.log(err.body);
    } else {
      res.sendFile(path.join(__dirname + '/views/index.html'));
    }
  });
};
 
// This is where you would initially send users to authorize 
app.get('/', exports.authorize_user);
// This is your redirect URI 
app.get('/game', exports.handleauth);
 
server.listen(PORT, function(){
  console.log("Express server listening on port " + PORT);
});