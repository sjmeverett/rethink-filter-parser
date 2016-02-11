
var jsep = require('jsep');
var Walker = require('./Walker');

var regexes = [
  // lambdas: (x) => expression
  /^\((\w+)\)\s*=>\s*(.*)$/,
  // normal (very simple) functions: function (x) { return expression; }
  /^function\s+(?:\w+)?\s*\((\w+)\)\s*{\s*return\s+([^;]+);\s*}$/m
];


function parseFunction(fn, ctx) {
  var code = fn.toString();
  var m;

  for (var i = 0; i < regexes.length && !m; i++) {
    m = code.match(regexes[i]);
  }

  if (!m) {
    throw new Error('function must be either simple lambda or function with single return statement');
  }

  var param = m[1];
  var ast = jsep(m[2]);
  return walkAst(param, ctx, ast);
}


function walkAst(param, ctx, ast) {
  return new Walker(param, ctx).walk(ast);
}


module.exports = parseFunction;
