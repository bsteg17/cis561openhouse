$(document).ready(function() {
    
    views = $('.view');
    
    socket = io();

    socket.on('askForChoice', function(profiles) {
        console.log(profiles); //debug
        chooseView = document.getElementById('choose-view');
        views.hide();
        chooseView.style.visibility = 'visible';
    });
    
});