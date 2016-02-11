
var r = require('rethinkdb');


function Walker(param, ctx) {
  this.param = param;
  this.ctx = ctx;
}

Walker.prototype.walk = function (ast) {
  if (!Walker.prototype.hasOwnProperty(ast.type)) {
    throw new Error('can\'t handle ' + ast.type);
  }

  return Walker.prototype[ast.type].call(this, ast);
};


var binaryOperators = {
  '===': 'eq',
  '==': 'eq',
  '>': 'gt',
  '>=': 'gte',
  '<': 'lt',
  '<=': 'lte'
};


Walker.prototype.BinaryExpression = function (ast) {
  var op = binaryOperators[ast.operator];

  if (!op)
    throw new Error('Unsupported operator ' + ast.operator);

  var left = this.walk(ast.left);
  var right = this.walk(ast.right);
  return left[op](right);
};


Walker.prototype.MemberExpression = function (ast) {
  var obj, prop;

  if (ast.object.type !== 'Identifier') {
    obj = this.walk(ast.object);
  } else if (ast.object.name !== this.param) {
    throw new Error('unexpected MemberExpression object ' + ast.object.name);
  } else {
    obj = r.row;
  }

  if (ast.property.type !== 'Identifier') {
    prop = this.walk(ast.property);
  } else {
    prop = ast.property.name;
  }

  return obj(prop);
};


Walker.prototype.Literal = function (ast) {
  return ast.value;
};


Walker.prototype.Identifier = function (ast) {
  if (!this.ctx.hasOwnProperty(ast.name))
    throw new Error('unknown identifier ' + ast.name);

  return this.ctx[ast.name];
};

module.exports = Walker;
