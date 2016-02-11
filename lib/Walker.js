
var debug = require('debug')('rethink-filter-parser');
var r = require('rethinkdb');
var util = require('util');


function Walker(param, ctx) {
  this.param = param;
  this.ctx = ctx;
}

Walker.prototype.walk = function (ast) {
  debug(util.inspect({start: ast}, {colors: true, depth: null}));

  if (!Walker.prototype.hasOwnProperty(ast.type)) {
    throw new Error('can\'t handle ' + ast.type);
  }

  var result = Walker.prototype[ast.type].call(this, ast);
  debug(util.inspect({ast: ast, result: result}, {colors: true, depth: null}));
  return result;
};


var binaryOperators = {
  '===': 'eq',
  '>': 'gt',
  '>=': 'ge',
  '<': 'lt',
  '<=': 'le',
  '!==': 'ne'
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
  var obj = this.walk(ast.object);
  var property;

  if (ast.property.type !== 'Identifier') {
    property = this.walk(ast.property);
  } else {
    property = ast.property.name;
  }

  if (obj.__row) {
    var result = obj(property);
    result.__row = true;
    return result;

  } else {
    return obj[property];
  }
};


Walker.prototype.Literal = function (ast) {
  return ast.value;
};


Walker.prototype.Identifier = function (ast) {
  if (ast.name === this.param) {
    var result = r.row;
    result.__row = true;
    return result;

  } else if (this.ctx.hasOwnProperty(ast.name)) {
    return this.ctx[ast.name];

  } else if (ast.name === 'ctx') {
    return this.ctx;

  } else {
    throw new Error('unknown identifier ' + ast.name);
  }
};

module.exports = Walker;
