# How to Start
## with a sample set of Twitter accounts (no auth keys necessary)
1. Clone the repo
   `git clone https://github.com/bsteg17/cis561openhouse.git`
2. Enter the repo and start the server
   `cd cis561openhouse`
   `node server.js`
3. Navigate to 'localhost:8080/game' in two new browser tabs. Each tab represents the browser window of a 'player.'
4. Enter some random gobbledeegook for the handle prompts in the tabs (\'@asdfasdf\') and press enter
5. Some profile pictures should appear. In each tab, select a profile picture. Your opponent will have to determine which profile you've chosen in order to win the game.

## with real Twitter accounts (auth keys necessary)
1. Clone the \'refactor\' branch of the repo 
   `git clone -b refactor https://github.com/bsteg17/cis561openhouse.git`
2. Create a \'secrets.js\' file. 
   `cd cis561openhouse/; vim secrets.js`
   In this file, simply export an object containing your Twitter consumer_key, consumer_secret, access_token_key, and access_token_secret.
   `exports = module.exports = {
      consumer_key: [YOUR CONSUMER KEY], 
      consumer_secret: [YOUR CONSUMER SECRET],
      access_token_key: [YOUR ACCESS TOKEN KEY],
      access_token_secret: [YOUR ACCESS TOKEN SECRET]
    }`
3. Start the server
   `node server.js`
4. Navigate to `localhost:8080/game` in two new browser tabs
5. Enter two different twitter accounts in each tab (must be public) to generate the game with and press enter. These two accounts need to be followiing at least 24 of the same accounts to play.
6. In each tab, select a profile picture. Your opponent will have to determine which profile you've chosen in order to win the game.

# How to Play
1. The profile picture should now display in the bottom right of each tab's viewport.
2. The game is played by taking turns asking yes-or-no questions about the opponent's chosen account. (Ex: Is the account owned by a famous person? Did I go to the same college as the person who owns the account?)
3. When it is Player A's turn to ask, the 'ask' button should be visible next to his/her text input box.
4. When 'ask' button is clicked, Player B can respond to the question by clicking the 'Yes' or 'No' buttons beneath the question in the chat box. (Players can also message one another without making official guesses by submitting text with the 'Chat' button.)
5. A history of the questions asked should be visible in the middle of the bottom of the viewport.
6. Players can keep track of which accounts cannot be their opponent's chosen account by clicking on the displayed profile pictures. Eliminated pictures will be covered with a horizontal gray bar.
7. When a player is ready to guess which account his opponent has chosen, he can submit a message with an /'@/' symbol followed by the handle of the account and press the 'guess' button.
8. If this player is right then the player wins and the game ends.

(Note: this game was developed for the Chrome browser in the spring of 2016 and has not been updated since then. The game may malfunction or have a skewed display due to browser updates or use with browsers other than Chrome.)
