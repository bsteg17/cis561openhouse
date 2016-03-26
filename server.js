express = require('express');

app = express();

CLIENT_ID = 'c0e99f553a0a4a86b026b6923d4e35ef';
CLIENT_SECRET = 'b0903108c6d44106b6b7994559a79de1';
PORT = 8000;
DOMAIN = 'http://localhost:'+PORT+'/';

app.get('/', function(req, res) {
    auth_url = 'https://api.instagram.com/oauth/authorize/'+
    '?client_id='+CLIENT_ID+'&redirect_uri='+(DOMAIN+'game')+'&response_type=code'
    res.redirect(auth_url);
});

app.get('/game', function(req, res) {
    if (res.query.error) {
        // handle auth error
    }
    code = req.query.code;
    
});

app.listen(PORT, function() {
    console.log("listening on port "+PORT);
});
