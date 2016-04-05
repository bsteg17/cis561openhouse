var socket;
var profiles;

$(document).ready(function() {
    
    $('#choices').empty();
    
    socket = io();
    socket.on('connect', function() {
        socket.on('askForChoice', onAskForChoice);
    });
});

function onAskForChoice(profs) {
    profiles = profs;
    console.log(profiles); //debug
    showChooseView();
}

function showChooseView() {
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
    socket.emit('choice', index);
}

