var socket;
var profiles;
var me;

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
        $("#chat-submit").on('click', onSendMessage);
        $("#question-submit").on('click', onAskQuestion);
        $(document).on('click', '#yes', replyYes);
        $(document).on('click', '#no', replyNo);
        socket.on('askForChoice', onAskForChoice);
        socket.on('yourTurn', onMyTurn);
        socket.on('opponentsTurn', onOpponentsTurn);
        socket.on('recieveMessage', onRecieveMessage);
        socket.on('myQuestion', onMyQuestion);
        socket.on('myOpponentsQuestion', onOpponentsQuestion);
    });
});

function onSubmitHandle(handle) {
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
   generateGrid('#choices');
   
   $('.profile-choice').on('click', function() {
       onSelectChoice($(this));
   });
}

function onSelectChoice(choice) {
    screen_name = choice.attr('name');
    playerID = socket.id;
    socket.emit('choice', {screen_name: screen_name, playerID: playerID});
}

function onMyTurn() {
    console.log('my turn'); //debug
    showView('#game-view', generateMyTurnView);
}

function onOpponentsTurn() {
    console.log('my opp turn'); //debug
    showView('#game-view', generateOpponentsTurnView);
}

function generateMyTurnView() {
    generateGrid('#my-grid');
    generateChat();
    $('#question-submit').prop('disabled', false);
}

function generateOpponentsTurnView() {
    generateGrid('#my-grid');
    generateChat();
    $('#question-submit').prop('disabled', true);
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
    postMessage({text:'Welcome to Tweet-Guess', handle:'TweetGuess'});
}

function onSendMessage() {
    input = $('#my-chat-input');
    socket.emit('chatMessage', {text:input.val(), playerID:socket.id});
    input.val('');
}

function onRecieveMessage(message) {
    postMessage(message);
}

function postMessage(message) {
    messageHistory = $('#my-chat-messages');
    messageHistory.append('<li><strong>'+message.handle+'</strong>  -  '+message.text+'</li>');
}

function onAskQuestion() {
    $('#question-submit').prop('disabled', true);
    input = $('#my-chat-input');
    socket.emit('askQuestion', {text:input.val(), playerID:socket.id});
    input.val('');
}

function onMyQuestion(question) {
    console.log('my question: '+question);
    postMyQuestion(question);
}

function onOpponentsQuestion(question) {
    console.log('my opps question: '+question);
    postOpponentsQuestion(question);
}

function postMyQuestion(question) {
    console.log('entered postmyquestion'); //debug
    messageHistory = $('#my-chat-messages');
    messageHistory.append('<li class="question"><strong>'+question.handle+'</strong>  -  '+question.text+'</li>');
}

function postOpponentsQuestion(question) {
    console.log('entered postopponentsquestion'); //debug
    messageHistory = $('#my-chat-messages');
    messageHistory.append('<li class="question"><strong>'+question.handle+'</strong>  -  '+question.text+'</li>');
    messageHistory.append('<li id="answer"><button id="yes">YES</button><button id="no">NO</button></li>');
}

function replyYes() {
    $('#answer').remove();
    socket.emit('replyYes');
}

function replyNo() {
    $('#answer').remove();
    socket.emit('replyNo');
}