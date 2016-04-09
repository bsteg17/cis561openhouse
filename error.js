ERROR = {
    notEnoughMutuallyFollowing: function(profiles) {
        console.log("you need to follow at least 24 of the same accounts as your opponent to play");
        console.log("here are the accounts you currently mutually follow:");
        profiles.forEach(function(profile) {
           console.log(profile.screen_name); 
        });
    }
};

module.export = exports = ERROR;