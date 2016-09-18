#!/usr/bin/env node

var run = require('..');
var optimist = require('optimist');
var spawn = require('child_process').spawn;
var resolve = require('path').resolve;
var cwd = process.cwd();

var argv = optimist
  .usage('Pipe a browserify stream into this.\nbrowserify [opts] [files] | $0 [opts]')

  .describe('wait', 'Timeout for tap-finished')
  .alias('w', 'wait')

  .describe('port', 'Wait to be opened by a browser on that port')
  .alias('p', 'port')

  .describe('browser', 'Browser to use. ' +
      'Always available: electron. ' +
      'Available if installed: chrome, firefox, ie, phantom, safari')
  .alias('b', 'browser')
  .default('browser', 'electron')

  .describe('mock', 'Mock http server')
  .alias('m', 'mock')

  .describe('render', 'Command to pipe tap output to for custom rendering')
  .alias('r', 'render')

  .describe('help', 'Print usage instructions')
  .alias('h', 'help')

  .argv;

if (argv.help) {
  return optimist.showHelp();
}

if ('string' == typeof argv.mock) {
  argv.mock = require(resolve(cwd, argv.mock));
}

var runner = run(argv);

process.stdin
  .pipe(runner)
  .on('results', function (results) {
    process.exit(Number(!results.ok));
  });

if (argv.render) {
  var ps = spawn(argv.render);
  runner.pipe(ps.stdin);
  ps.stdout.pipe(process.stdout, { end: false });
  ps.stderr.pipe(process.stderr, { end: false });
} else {
  runner.pipe(process.stdout);
}
