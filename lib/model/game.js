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

  var drawn = this.runners.splice(0, 3), i;
  while (drawn.length < 3) {
    var drawnIndex = Math.floor(Math.random() * this.cup.length);
    var drawnDie = this.cup.splice(drawnIndex, 1)[0];
    drawn.push(drawnDie);

    drawnDie.roll();
    this[drawnDie.face+'s'].push(drawnDie);
  }

  this.rolled = drawn;
};

Model.prototype.stop = function() {
  this.checkRolled();
  this.score += this.brains.length;
  this.refillCup();
};

Model.prototype.checkRolled = function() {
  if (this.brains.length < 13 && this.shots.length < 3)
    return;

  if (this.brains.length >= 13)
    ++this.score;

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
