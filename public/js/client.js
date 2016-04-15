var socket;
var profiles;
var me;
var gameViewLoaded = false;

var ROW_WIDTH = 6,
    IMAGE_SIDE_LENGTH = document.documentElement.clientWidth / 6.075;

$(document).ready(function() {
    
    $('#choices').empty();
    
    socket = io();
    socket.on('connect', function() {
        console.log("connected");
        showView('#handle-input-view');
        
        //when enter button is push on handle select screen
        $('.handle-input input').keypress(function (e) {
            if (e.which == 13) {
                $('.handle-input').addClass('done');
                setTimeout(function() {
                    onSubmitHandle( $('.handle-input input').val() );
                    return false;
                }, 750);
            }
        });
        $('.handle-input input').on('input', function() {
            console.log($(this).val());
            if($(this).val().length > 0) {
                $('.trailing-question-mark').hide();
                $('.twitter-logo').hide();
            } else {
                $('.trailing-question-mark').show();
                $('.twitter-logo').show();
            }
        });
        
        $("#chat-submit").on('click', onSendMessage);
        $("#question-submit").on('click', function() {
            onAskQuestion($(this));
        });
        $('#guess-submit').on('click', onGuessSubmit);
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
        socket.on('youWin', youWin);
        socket.on('youLose', youLose);
    });
});



function onSubmitHandle(handle) {
    socket.emit('submitHandle', {playerID:socket.id, handle:handle});
    showView('#waiting-view', gradualShowWaiting());
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
    console.log(profs);
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
    $("#my-chat-input").on('input', function() {
            onChatInputChange($(this));
    });
    generateMyTurnView();
}

function onOpponentsTurn() {
    $('#handle-to-guess').hide();
    console.log('my opp turn'); //debug
    if (!gameViewLoaded) {
        generateMyFixedGameView();
    }
    $("#my-chat-input").off().on('input');
    generateOpponentsTurnView();
}

function generateMyTurnView() {    
    $('#question-submit').show();
}

function generateOpponentsTurnView() {
    $('#question-submit').hide();
}

function generateMyFixedGameView() {
    showView('#game-view', function() {
        generateGrid('#my-grid');
        generateChat();
        gameViewLoaded = true;
        $(document).on('click', '.profile-choice', function(e) {
            onClickProfilePic($(this));
            e.preventDefault();
        });
    });
}

function generateGrid(id) {
   var profs = [];
   grid = $(id);

   $.each(profiles, function(i, item) {
       profile = '<span class="imageWrap hvr-float"><a class="profile-choice" name="'+item.screen_name+'" href="#">';
       profile += '<img src="'+item.profile_image_url.replace('_normal.png','.png')+'" height="'+IMAGE_SIDE_LENGTH+'" width="'+IMAGE_SIDE_LENGTH+'" />';
       profile += '<span class="imageCaption hvr-bounce-in-right">@'+item.screen_name+'</span>';
       profile += '</a></span>';
       if ((i+1) % ROW_WIDTH == 0 || i == 23) { profile += '<br />'; } //at end of row put 
       profs.push(profile);
   });

   $(id).append( profs.join('') );
}

function generateChat() {
    postMessage({text:'Welcome to Tweet-Guess', handle:'TweetGuess'});
}

function onClickProfilePic(pic) {
    if(pic.parent().attr('class').indexOf('hvr-float') > -1) {
        pic.parent().removeClass('hvr-float');
        pic.parent().addClass('eliminated');
        console.log(pic);
    } else {
        pic.parent().removeClass('eliminated');
        pic.parent().addClass('hvr-float');
    }
}

function onChatInputChange(input) {
    regexDetectHandle = /\@(\S+)?/;
    handles = input.val().match(regexDetectHandle);
    if (handles != null) {
        $('.handle').text(handles[0]);
        $('#handle-to-guess').show();
        $('#question-submit').hide();
    } else {
        $('#handle-to-guess').hide();
        $('#question-submit').show();
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
    $('#question-submit').hide();
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
    $('#question-history').append('<li class="logged-handle">'+question.handle+'</li>');
    $('#question-history').append('<li class="logged-question">'+question.text+'</li>');
    $('#question-history').append('<li class="logged-answer">&nbsp;&nbsp;'+question.answer+'</li>');
    $('#question-history').append('<li>---------------------------------</li>');
}

function onGuessSubmit() {
    console.log('onguesssubmit');
    handle = $('.handle').text().substr(1);
    socket.emit('guess', {playerID:socket.id, handle:handle});
}

function youWin() {
    showView('#you-win');
}

function youLose() {
    showView('#you-lose');
}

function gradualShowWaiting() {
    setTimeout(function() {
        if ($('#game-view').attr('display','none')) {
            $('.waiting-main-title').show();
            setTimeout(function() {
                if ($('#game-view').attr('display','none')) {
                    $('.waiting-sub-title').show();
                    setTimeout(function() {
                        if ($('#game-view').attr('display','none')) {
                            $('.loading').show();
                        }
                    }, 500);
                }
            }, 500);
        }
    }, 200);
}

$('.handle-input input').autoGrowInput({comfortZone:0,maxWidth:700});


function randomHex() {
    hex_digits = ['1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];
    hex = "";
    for (i = 0; i < 6; i++) {
        hex += hex_digits[Math.floor(Math.random() * 16) - 1];
    }
    return '#'+hex;
}