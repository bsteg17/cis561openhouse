var socket;
var profiles;
var player;

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
    profiles = profs;
    showView('#choose-view', generateChooseView);
}

function generateChooseView() {
    var choices = [];

   $.each(profiles, function(i, item) {
       profile = '<li><img src="'+item.profile_image_url+'" />';
       profile += '<p><a href="#" class="profile-choice" name="'+item.screen_name+'"';
       profile += ' <strong>@'+item.screen_name+'</strong></p></li>';
       choices.push(profile);
   });

   $('#choices').append( choices.join('') );
   
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
    showView('#gameView', generateMyTurnView);
}

function onOpponentsTurn() {
    console.log('my opp turn');
    showView('#gameView', generateOpponentsTurnView);
}

function generateMyTurnView() {
    
}

function generateOpponentsTurnView() {
    
}