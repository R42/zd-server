var identifier = require('identifier');
var Die = require('./die');

var diceSet = {
  red: 3,
  yellow: 4,
  green: 6
};

var Model = function(nickname) {

  this.id = identifier(5);
  this.nickname = nickname;
  this.vp = 0;
  this.rounds = 0;

  this.score = 0;
  
  this.cup = [];
  this.used = [];
  
  this.brains = [];
  this.shots = [];
  this.runners = [];
  this.modified = +new Date();

  for(var color in diceSet)
    for(var i=0; i<diceSet[color]; ++i)
      this.cup.push(new Die(color));
};

Model.prototype.roll = function() {

  this.checkRolled();

  var i, die;

  // runners must be included in the roll
  var drawn = [];
  for (i=0; i<this.used.length; ++i) {
    die = this.used[i];
    if (die.face != 'runner')
        continue;
    drawn.push(this.used.splice(i, 1)[0]);
  }

  // if there are not enough dice in the cup
  // put all the brains back in the cup
  if (this.cup.length + drawn.length < 3) {
    for (i=0; i<this.used.length; ++i) {
      die = this.used[i];
      if (die.face != 'brain')
        continue;
      this.cup.push(this.used.splice(i, 1)[0]);
    }
  }

  // collect additional dice from the cup
  while (drawn.length < 3) {
    i = Math.floor(Math.random() * this.cup.length);
    die = this.cup.splice(i, 1)[0];
    drawn.push(die);
  }

  // roll them and score them
  for(i=0; i<drawn.length; ++i) {
    die = drawn[i];
    die.roll();
    this.used.push(die);
    this[die.face+'s'].push({ face: die.face, color: die.color });
  }

  this.rolled = drawn;
};

Model.prototype.stop = function() {
  this.checkRolled();
  this.score += this.brains.length;
  this.refillCup();
};

Model.prototype.checkRolled = function() {
  if (this.brains.length + this.score < 13 && this.shots.length < 3)
    return;

  if (this.brains.length + this.score >= 13) {
    ++this.vp;
    this.score = 0;
  }

  this.rounds++;
  this.refillCup();
};

Model.prototype.refillCup = function() {
  this.cup = this.cup.concat(this.used.splice(0, 13));
  
  this.brains.splice(0, 13);
  this.shots.splice(0, 13);
  this.runners.splice(0, 3);
};

Model.prototype.clientModel = function() {
  var whitelist = [
  'id',
  'nickname',
  'vp',
  'rounds',
  'score',
  'rolled'
  ];

  var result = {};
  
  var i;
  for (i=0; i<whitelist.length; ++i)
    result[whitelist[i]] = this[whitelist[i]];

  var self = this;
  ['brains', 'shots', 'runners'].forEach(function(type) {
    result[type] = [];
    self[type].forEach(function(die) {
      result[type].push(die.color);
    });
  });

  this.modified = +new Date();

  return result;
};

module.exports = exports = Model;
