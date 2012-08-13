var should = require('should');
var _ = require('lodash');

var model;

describe('model', function() {

  before(function() {
    model = require('../model');
  });

  it('should export an object', function() {
    model.should.be.a('object');
  });

  it('should contain a definition for Die', function() {
    model.should.have.key('Die');
    model.Die.should.be.a('function');
  });

  describe('Die', function() {

    it('should have a color in the form of string', function() {
      var die = new model.Die('yellow');
      die.should.have.property('color');
      die.color.should.be.a('string');
      die.color.should.equal('yellow');
    });

    it('should only accept colors [red,yellow,green]', function() {
      (function() { new model.Die('red'); }).should.not.throw();
      (function() { new model.Die('red'); }).should.not.throw();
      (function() { new model.Die('red'); }).should.not.throw();
      (function() { new model.Die('bleberish'); }).should.throw('invalid color');
    });

    it('should have faces, in the right amounts', function() {
      var self = function(f) { return f; };
      var dieFaces = {
        red:    ['runner', 'runner', 'shot', 'shot',  'shot',  'brain'],
        yellow: ['runner', 'runner', 'shot', 'shot',  'brain', 'brain'],
        green:  ['runner', 'runner', 'shot', 'brain', 'brain', 'brain']
      };

      _.all(_.keys(dieFaces), function(color) {
        return _.sortBy(new model.Die(color).faces, self).should.eql(_.sortBy(dieFaces[color], self));
      }).should.be.true;
    });

    it('should roll a random face', function() {
      var results = {};
      var die = new model.Die('yellow');
      die.roll.should.be.a('function');

      for(var i=0; i<300; ++i) {
        die.roll();
        should.exist(die.face);
        die.face.should.be.ok;
        var face = die.face;
        if (!results.hasOwnProperty('face'))
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

});