var should = require('should');
var _ = require('lodash');

var model;
var Die;
var Game;

describe('model', function() {

  before(function() {
    model = require('../lib/model');
    Die = model.Die;
    Game = model.Game;
  });

  it('should export an object', function() {
    model.should.be.a('object');
  });

  it('should contain a definition for Die', function() {
    model.should.have.property('Die');
    model.Die.should.be.a('function');
  });

  it('should contain a definition for Game', function() {
    model.should.have.property('Game');
    model.Die.should.be.a('function');
  });

  describe('Die', function() {

    it('should have a color in the form of string', function() {
      var die = new Die('yellow');
      die.should.have.property('color');
      die.color.should.be.a('string');
      die.color.should.equal('yellow');
    });

    it('should only accept colors [red,yellow,green]', function() {
      (function() { new Die('red'); }).should.not.throw();
      (function() { new Die('red'); }).should.not.throw();
      (function() { new Die('red'); }).should.not.throw();
      (function() { new Die('bleberish'); }).should.throw('invalid color');
    });

    it('should have faces, in the right amounts', function() {
      var self = function(f) { return f; };
      var dieFaces = {
        red:    ['runner', 'runner', 'shot', 'shot',  'shot',  'brain'],
        yellow: ['runner', 'runner', 'shot', 'shot',  'brain', 'brain'],
        green:  ['runner', 'runner', 'shot', 'brain', 'brain', 'brain']
      };

      _.all(_.keys(dieFaces), function(color) {
        return _.sortBy(new Die(color).getAllFaces(), self).should.eql(_.sortBy(dieFaces[color], self));
      }).should.be.true;
    });

    it('should roll a random face', function() {
      var results = {};
      var die = new Die('yellow');
      die.roll.should.be.a('function');

      for(var i=0; i<300; ++i) {
        die.roll();
        should.exist(die.face);
        die.face.should.be.ok;
        var face = die.face;
        if (!results.hasOwnProperty(face))
          results[face] = 1;
        else 
          results[face] = results[face] + 1;
      }

      _.chain(results)
        .keys()
        .sortBy(function(f) {return f;})
        .value()
        .should.eql(['brain', 'runner', 'shot']);
    });
  });

  describe('Game', function() {

    var game;

    before(function() {
      game = new Game('Rulio');
    });

    it('generates a random ID', function() {
      var ids = [];
      for (var i=0; i<200; ++i) {
        ids.push(new Game().id);
      }

      ids.length.should.equal(_.uniq(ids).length);
    });

    it('should belong to single nickname', function() {
      game.should.have.property('nickname').equal('Rulio');
    });

    it('should start with score 0', function() {
      game.should.have.property('score').equal(0);
    });

    it('should have an array for rolled brains', function() {
      game.should.have.property('brains');
      game.brains.should.be.an.instanceOf(Array);
    });

    it('should have an array for rolled shots', function() {
      game.should.have.property('shots');
      game.shots.should.be.an.instanceOf(Array);
    });

    it('should have an array for rolled runners', function() {
      game.should.have.property('runners');
      game.runners.should.be.an.instanceOf(Array);
    });

    it('should have an array for dice in the cup', function() {
      game.should.have.property('cup');
      game.cup.should.be.an.instanceOf(Array);
    });

    it('should start with all dices in the cup', function() {
      game.cup.should.have.lengthOf(13);
      game.brains.should.have.lengthOf(0);
      game.shots.should.have.lengthOf(0);
      game.runners.should.have.lengthOf(0);
    });

    it('should have a roll mehtod', function() {
      game.should.have.property('roll');
      game.roll.should.be.a('function');
    });

    it('should roll', function() {
      game.roll();
      game.should.have.property('rolled').with.length(3);
      _.each(game.rolled, function(die) {
        should.exist(die);
        die.should.have.property('color');
        die.should.have.property('face');
      });

      (game.shots.length + game.runners.length + game.brains.length).should.equal(3);
      game.cup.length.should.equal(10);
    });

    it('should have a timestamp', function() {
      game.should.have.property('modified');
      game.modified.should.be.below(+new Date());
    });

    it('should update the timestamp when the client model is requested', function() {
      var old = game.modified;
      game.clientModel();
      old.should.be.below(game.modified);
    });

    it('should count the rounds', function() {
      game.should.have.property('rounds');
      
      var value = game.rounds;
      for(var i=0; i<1000; ++i)
        game.roll();

      game.rounds.should.be.above(value);
    });
  });
});