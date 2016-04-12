var socket;
var profiles;
var player;

var ROW_WIDTH = 5;

$(document).ready(function() {
    
    $('#choices').empty();
    
    socket = io();
    socket.on('connect', function() {
        console.log("connected");
        showView('#handle-input-view');
        $("#submit-handle").on('click', function() {
            onSubmitHandle( $('#handle').val() );
        });
        socket.on('askForChoice', onAskForChoice);
        socket.on('yourTurn', onMyTurn);
        socket.on('opponentsTurn', onOpponentsTurn);
    });
});

function onSubmitHandle(handle) {
    console.log("submitted handle"); //debug
    socket.emit('submitHandle', {playerID:socket.id, handle:handle});
    showView('#waiting-view');
}

function showView(id, callback) {
    if(callback){ callback(); }
    viewsToHide = $('.view');
    viewToDisplay = $(id);
    viewsToHide.hide();
    viewToDisplay.css('display', 'block');
}

function onAskForChoice(profs) {
    console.log('asked for choice');
    profiles = profs;
    showView('#choose-view', generateChooseView);
}

function generateChooseView() {
   generateGrid('#choices');
   
   $('.profile-choice').on('click', function() {
       console.log($(this)); //debug
       onSelectChoice($(this));
   });
}

function onSelectChoice(choice) {
    screen_name = choice.attr('name');
    playerID = socket.id;
    socket.emit('choice', {screen_name: screen_name, playerID: playerID});
}

function onMyTurn() {
    console.log('my turn');
    showView('#game-view', generateMyTurnView);
}

function onOpponentsTurn() {
    console.log('my opp turn');
    showView('#game-view', generateOpponentsTurnView);
}

function generateMyTurnView() {
    generateGrid('#my-grid');
    generateChat();
    //jqeury stuff
}

function generateOpponentsTurnView() {
    generateGrid('#my-grid');
    generateChat();
    //jqeury stuff
}

function generateGrid(id) {
   var profs = [];
   grid = $(id);
   grid.append('<tbody>');

   $.each(profiles, function(i, item) {
       if (i % ROW_WIDTH == 0) { profile = '<tr>' } else { profile = '' }
       profile += '<td><img src="'+item.profile_image_url+'" /><br />';
       profile += '<a href="#" class="profile-choice" name="'+item.screen_name+'"';
       profile += ' <strong>@'+item.screen_name+'</strong></td>';
       if ((i+1) % ROW_WIDTH == 0 || i == 23) { profile += '</tr>'; } //at end of row put 
       profs.push(profile);
   });

   $(id).append( profs.join('') );
   grid.append('</tbody>');
}

function generateChat() {
    
}