var exec = require('child_process').exec;
var sysPath = require('path');
var fs = require('fs');

var mode = process.argv[2];

var fsExists = fs.exists || sysPath.exists;

var execute = function(pathParts, params, callback) {
  var path = sysPath.join.apply(null, pathParts);
  var command = 'node ' + path + ' ' + params;

  if (callback == null) callback = function() {};
  // npm install when run in parent package ignores the child's dependencies if such
  // ones are already listed in parent's package.json:
  // https://github.com/npm/npm/issues/2442
  // https://github.com/npm/npm/issues/1341
  // So, if parent app already depends on coffee-script  this package wont be installed
  // resulting in 'missing module' error thrown since postinstall command considers
  // the coffee bin be locally available
  if (pathParts.slice(-1)[0] === 'coffee') {
    executor(command, coffeeErrorHandler.bind(null, params))
  } else {
    executor(command);
  }
};

var executor = function (command, callback) {
  if (callback === undefined) {
    callback = function(error, stdout, stderr) {
      if (error != null) return process.stderr.write(stderr.toString());
      console.log(stdout.toString());
    };
  }
  console.log('Executing', command);
  exec(command, callback);
};

var coffeeErrorHandler = function (params, error, stdout, stderr) {
  var command = 'coffee' + ' ' + params;
  if (error != null) executor(command);
  else {
    console.log(stdout.toString());
  }
};

if (mode === 'postinstall') {
  fsExists(sysPath.join(__dirname, 'lib'), function(exists) {
    if (exists) return;
    execute(['node_modules', 'coffee-script', 'bin', 'coffee'], '-o lib/ src/');
  });
} else if (mode === 'test') {
  execute(['node_modules', 'mocha', 'bin', 'mocha'],
    '--require test/common.js --colors');
}
