
var socket;
var profiles;
var me;
var gameViewLoaded = false;
var chosenProfile;

var ROW_WIDTH = 6,
    IMAGE_SIDE_LENGTH = document.documentElement.clientWidth / 6.075;

$(document).ready(function() {
    
    $('#choices').empty();
    
    socket = io();
    socket.on('connect', function() {
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
            replyWithAnswer($(this).val());
        });
        $(document).on('mouseover', '.imageWrap', function() {
            changeBackgroundColor(this);
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
    // alert("So first you have to choose a profile picture. This is the pic for the"+
    // "account that your opponent must guess in order to win. Once you pick, the player"+
    // "who is randomly assigned first turn will be able to ask the other player a question."+
    // "All answers should be truthful, we'll be able to see the questions and answers"+
    // "after the game is over and we know who the other player's card was. So anyway players"+
    // "take turns asking yes/no questions to try and deduce the other player's profile "+
    // "(you can click on the pictures to help you keep track of who cannot be the other"+
    // "player's card.) When you're ready to guess at a specific profile, type the twitter"+
    // "handle of that profile into the chat box and press the guess button (putting the '@'"+
    // "in front is important.) Like I said before, first one to guess the other's chosen"+
    // "profile wins the game.");
    profiles = profs;
    showView('#choose-view', generateChooseView);
}

function generateChooseView() {
   generateGrid('#choices');
   
   $('.profile-choice').on('click', function(e) {
       onSelectChoice($(this));
       e.preventDefault();
   });
}


function onSelectChoice(choice) {
    chosenProfile = choice;
    screen_name = choice.attr('name');
    playerID = socket.id;
    socket.emit('choice', {screen_name: screen_name, playerID: playerID});
}

function onMyTurn() {
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
        generateChosenPic();
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
       profile += '<img src="'+item.profile_image_url.replace('_normal.png','.png')+'" height="'+IMAGE_SIDE_LENGTH+'" width="'+IMAGE_SIDE_LENGTH+'" name="'+item.screen_name+'" />';
       profile += '<span class="imageCaption hvr-bounce-in-right">@'+item.screen_name+'</span>';
       profile += '</a></span>';
       if ((i+1) % ROW_WIDTH == 0 || i == 23) { profile += '<br />'; } //at end of row put 
       profs.push(profile);
   });

   $(id).append( profs.join('') );
   generateColoredBackgrounds();
}

function generateChat() {
    postMessage({text:'Welcome to Tweet-Guess', handle:'TweetGuess'});
}

function generateColoredBackgrounds() {
    images = $('.imageWrap');
    images.each(function(i, image) {
        $(image).attr('background-color', randomHex());
    });
}

function changeBackgroundColor(image) {
    $('body').css('background-color', $(image).attr('background-color'));
}

function generateChosenPic() {
    profile = '<span class="imageWrap hvr-float chosen-image">';
       profile += '<img src="'+chosenProfile.children('img').attr('src')+'" />';
       profile += '<span class="imageCaption hvr-bounce-in-right">@'+chosenProfile.attr('name')+'</span>';
       profile += '<br /><br /><br /><br /><br /></span>';
       profile += '</a></span>';
    $('.chosen-image').html(profile);
}

function onClickProfilePic(pic) {
    if(pic.parent().attr('class').indexOf('hvr-float') > -1) {
        pic.parent().removeClass('hvr-float');
        pic.parent().addClass('eliminated');
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
    messageHistory = $('.my-chat-messages');
    messageHistory.append('<li><strong>'+message.handle+'</strong>  -  '+message.text+'</li>');
}

function onAskQuestion() {
    $('#question-submit').hide();
    input = $('#my-chat-input');
    socket.emit('askQuestion', {text:input.val(), playerID:socket.id});
    input.val('');
}

function onMyQuestion(question) {
    messageHistory = $('.my-chat-messages');
    messageHistory.append('<li class="question"><strong>'+question.handle+'</strong>  -  '+question.text+'</li>');
}

function onOpponentsQuestion(question) {
    messageHistory = $('.my-chat-messages');
    messageHistory.append('<div class="question opponent-chat"><strong>'+question.handle+'</strong>  -  '+question.text+'</li>');
    messageHistory.append('<div class="answer-wrapper"><button value="yes" class="answer" id="yes">YES</button><button value="no" class="answer" id="no">NO</button></li>');
}

function replyWithAnswer(answer) {
    $('.answer-wrapper').remove();
    socket.emit('replyWithAnswer', answer);
}

function onAddQuestionToLog(question) {
    questionHistoryEntry = $('<div/>', {class: 'question-history-entry'});
    $('.question-history').append(questionHistoryEntry);
    questionHistoryEntry.append('<div class="logged-handle">'+question.handle+'</div>');
    questionHistoryEntry.append('<div class="logged-question">'+question.text+'</div>');
    questionHistoryEntry.append('<div class="logged-answer">&nbsp;&nbsp;'+question.answer+'<div>');
}

function onGuessSubmit() {
    handle = $('.handle').text().substr(1);
    socket.emit('guess', {playerID:socket.id, handle:handle});
}

function youWin(questions) {
    showView('#you-win');
    // listQuestionsForReview();
}

function youLose(questions) {
    showView('#you-lose');
    // listQuestionsForReview();
}

// function listQuestionsForReview() {
//     questions.forEach(function(q){
//         qList = $('.questions-review');
//         question = "<strong>"+q.handle+"</strong><br />";
//         question += q.text+"<br />";
//         question += q.answer+"<br />"
//         question += "<hr />";
//         qList.html(qList.innerHtml()+question);
//     });
// }

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

getObjectValues = function(object) {
    values = [];
    for (var key in object) {
        values.push(object[key]);
    }
    return values;
}