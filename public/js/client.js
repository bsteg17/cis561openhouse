$(document).ready(function() {
    
    $('#choices').text( '' );
    
    socket = io();

    socket.on('askForChoice', function(profiles) {
        console.log(profiles); //debug
        showChooseView(profiles);
    });
    
});

function showChooseView(profiles) {
    var choices = [];

   $.each(profiles, function(i, item) {

          choices.push('<li><<img src="'+item.profile_image_url+'" /><p><strong>@'+item.screen_name+'</strong></p></li>');

   });

   $('#choices').append( choices.join('') );
    
    views = $('.view');
    chooseView = $('#choose-view');
    views.hide();
    chooseView.css('display', 'block');
}