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
        socket.on('onAskForChoice', onAskForChoice);
    });
});

function onSubmitHandle(handle) {
    console.log("submitted handle"); //debug
    socket.emit('submitHandle', {playerID:socket.id, handle:handle});
    showView('#waiting-view');
}

function showView(id) {
    viewsToHide = $('.view');
    viewToDisplay = $(id);
    viewsToHide.hide();
    viewToDisplay.css('display', 'block');
}

function onAskForChoice(profs) {
    console.log('onAskForChoice', profs);
    // profiles = profs;
    // console.log(profiles); //debug
    // showChooseView();
}

function onShowChooseView() {
    var choices = [];

   $.each(profiles, function(i, item) {
       profile = '<li><img src="'+item.profile_image_url+'" />';
       profile += '<p><a href="#" onclick="onSelectChoice('+i+')" <strong>@'+item.screen_name+'</strong></p></li>';
       choices.push(profile);
   });

   $('#choices').append( choices.join('') );
    
    views = $('.view');
    chooseView = $('#choose-view');
    views.hide();
    chooseView.css('display', 'block');
}

function onSelectChoice(index) {
    console.log(index); //debug
    socket.emit('choice', {index: index, playerId: playerId});
}

