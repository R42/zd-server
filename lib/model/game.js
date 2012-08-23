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

  // runners must be included in the roll
  var drawn = this.runners.splice(0, 3);

  // if there are not enough dice in the cup
  // put all the brains back in the cup
  // and score them
  if (this.cup.length + drawn.length < 3) {
    this.score += this.brains.length;
    this.cup = this.cup.concat(this.brains.splice(0, this.brains.length));
  }

  // collect additional dice from the cup
  while (drawn.length < 3) {
    var idx = Math.floor(Math.random() * this.cup.length);
    var die = this.cup.splice(idx, 1)[0];
    drawn.push(die);
  }

  // roll the dice
  drawn.forEach(function(die) {
    die.roll();
    this[die.face+'s'].push(die);
  }, this);

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
  this.cup = this.cup
    .concat(this.brains.splice(0, 13))
    .concat(this.shots.splice(0, 13))
    .concat(this.runners.splice(0, 3));
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
