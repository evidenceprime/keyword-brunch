var exec = require('child_process').exec;
var sysPath = require('path');
var fs = require('fs');

var mode = process.argv[2];

var fsExists = fs.exists;
var fsExistsSync = fs.existsSync

var execute = function(pathParts, params, callback) {
  if (callback == null) callback = function() {};
  var path = sysPath.join.apply(null, pathParts);
  var command = 'node ' + path + ' ' + params;
  console.log('Executing', command);
  exec(command, function(error, stdout, stderr) {
    if (error != null) return process.stderr.write(stderr.toString());
    console.log(stdout.toString());
  });
};

if (mode === 'postinstall') {
  fsExists(sysPath.join(__dirname, 'lib'), function(exists) {
    if (exists) return;
    compileAndSave();
  });
} else if (mode === 'test') {
  execute(['node_modules', 'mocha', 'bin', 'mocha'],
    '--require test/common.js --colors');
}

var compileAndSave = function () {
  var coffee = require('coffee-script');
  var srcDir = sysPath.join(__dirname, 'src');
  var distDir = sysPath.join(__dirname, 'lib');
  var filesToCompile = fs.readdirSync(srcDir);

  if (!fsExistsSync(distDir)) {
    fs.mkdirSync(distDir);
  }

  filesToCompile.forEach(function (fileName) {
    var filePath = sysPath.join(srcDir, fileName);
    fs.readFile(filePath, {encoding: 'utf8'}, function(err, data) {
      if (err) throw err;
      var compiledJs = coffee.compile(data);
      var distFileName = sysPath.join(distDir, fileName.replace(/coffee$/, 'js'));
      fs.writeFile(distFileName, compiledJs, function (err) {
        if (err) throw err;
      });
    });
  });
}
