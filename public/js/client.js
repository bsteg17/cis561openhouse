var socket;
var profiles;
var me;
var gameViewLoaded = false;

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
        $("#my-chat-input").on('input', function() {
            onChatInputChange($(this));
        });
        $("#chat-submit").on('click', onSendMessage);
        $("#question-submit").on('click', function() {
            onAskQuestion($(this));
        });
        $(document).on('click', '.answer', function() {
            console.log($(this).val())
            replyWithAnswer($(this).val());
        });
        socket.on('askForChoice', onAskForChoice);
        socket.on('yourTurn', onMyTurn);
        socket.on('opponentsTurn', onOpponentsTurn);
        socket.on('recieveMessage', onRecieveMessage);
        socket.on('myQuestion', onMyQuestion);
        socket.on('myOpponentsQuestion', onOpponentsQuestion);
        socket.on('addQuestionToLog', onAddQuestionToLog);
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
    if (!gameViewLoaded) {
        generateMyFixedGameView();
    }
    generateMyTurnView();
}

function onOpponentsTurn() {
    console.log('my opp turn'); //debug
    if (!gameViewLoaded) {
        generateMyFixedGameView();
    }
    generateOpponentsTurnView();
}

function generateMyTurnView() {    
    $('#question-submit').prop('disabled', false);
}

function generateOpponentsTurnView() {
    $('#question-submit').prop('disabled', true);
}

function generateMyFixedGameView() {
    showView('#game-view', function() {
        generateGrid('#my-grid');
        generateChat();
        gameViewLoaded = true;
    });
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

function onChatInputChange(input) {
    console.log(input.val());
    regexDetectHandle = /\@(\S+)?/;
    handles = input.val().match(regexDetectHandle);
    console.log(handles);
    if (handles != null) {
        $('#handle-to-guess').html('Guess if the winning card is<br/><span class="handle">'+handles[0]+'</span>?');
    } else {
        $('#handle-to-guess').html('');
    }
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
    console.log('entered postmyquestion'); //debug
    messageHistory = $('#my-chat-messages');
    messageHistory.append('<li class="question"><strong>'+question.handle+'</strong>  -  '+question.text+'</li>');
}

function onOpponentsQuestion(question) {
    console.log('entered postopponentsquestion'); //debug
    messageHistory = $('#my-chat-messages');
    messageHistory.append('<li class="question"><strong>'+question.handle+'</strong>  -  '+question.text+'</li>');
    messageHistory.append('<li class="answer-wrapper"><button value="yes" class="answer" id="yes">YES</button><button value="no" class="answer" id="no">NO</button></li>');
}

function replyWithAnswer(answer) {
    $('.answer-wrapper').remove();
    socket.emit('replyWithAnswer', answer);
}

function onAddQuestionToLog(question) {
    $('#question-history').append('<li class="logged-question">'+question.text+'</li>');
    $('#question-history').append('<li class="logged-answer">&nbsp;&nbsp;'+question.answer+'</li>');
}

