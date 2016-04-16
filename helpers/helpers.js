module.exports.intersectSafe = function(a, b)
{
    // sorts arrays of 'following' by handle
  module.exports.sortFollowingByHandle(a);
  module.exports.sortFollowingByHandle(b);
  
  // uses handle to find mutual 'following'
  var ai = 0, bi = 0;
  var result = [];

  while( ai < a.length && bi < b.length )
  {
     if      (a[ai]['screen_name'] < b[bi]['screen_name'] ){ ai++; }
     else if (a[ai]['screen_name'] > b[bi]['screen_name'] ){ bi++; }
     else /* they're equal */
     {
       result.push(a[ai]);
       ai++;
       bi++;
     }
  }

  return result;
}

module.exports.sortFollowingByHandle = function(following) {
    following.sort(function(i, j) {
        var handleA = i['screen_name'].toUpperCase();
        var handleB = j['screen_name'].toUpperCase();
        return (handleA < handleB) ? -1 : (handleA > handleB) ? 1 : 0;
    });
}

module.exports.getObjectValues = function(object) {
    values = [];
    for (var key in object) {
        values.push(object[key]);
    }
    return values;
}

module.exports.getObjectKeys = function(object) {
    keys = [];
    for (var key in object) {
        keys.push(key);
    }
    return keys;
}

module.exports.numKeys = function(obj) {
    num = 0;
    for (var key in obj) {
        num++;
    }
    return num;
}

module.exports.allPlayersHaveAttr = function(players, attr) {
    for (var key in players) {
        if (!players[key].hasOwnProperty(attr)) {
            return false && module.exports.numKeys(players) == 2;
        }
    }
    return true && module.exports.numKeys(players) == 2;
}

module.exports.getOpponent = function(players, playerID) {
    for (var key in players) {
        if (key != '/#'+playerID) {
            return players[key];
        }
    }
    return null;
}