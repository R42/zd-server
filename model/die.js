var dieFaces = {
  red:    ['runner', 'runner', 'shot', 'shot',  'shot',  'brain'],
  yellow: ['runner', 'runner', 'shot', 'shot',  'brain', 'brain'],
  green:  ['runner', 'runner', 'shot', 'brain', 'brain', 'brain']
};

var Model = function(color) {
  if (!dieFaces.hasOwnProperty(color))
    throw new Error('invalid color');

  this.color = color.toString();
  this.faces = dieFaces[this.color];
};

Model.prototype.fuck = function() { console.log('SOB'); return 'asdsadadsa'; };

Model.prototype.roll = function() {
  this.face = this.faces[Math.floor(Math.random() * this.faces.length)];
  return this.face;
};

module.exports = exports = Model;
