var dieFaces = {
  red:    ['runner', 'runner', 'shot', 'shot',  'shot',  'brain'],
  yellow: ['runner', 'runner', 'shot', 'shot',  'brain', 'brain'],
  green:  ['runner', 'runner', 'shot', 'brain', 'brain', 'brain']
};

var Model = function(color) {
  if (!dieFaces.hasOwnProperty(color))
    throw new Error('invalid color');

  this.color = color.toString();
};

Model.prototype.getAllFaces = function() {
  return dieFaces[this.color];
};

Model.prototype.roll = function() {
  var faces = this.getAllFaces();
  this.face = faces[Math.floor(Math.random() * faces.length)];
  return this.face;
};

module.exports = exports = Model;
