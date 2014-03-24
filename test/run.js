var fs = require('fs');
var path = require('path');
var vm = require('vm');
var test = require('tap').test;
var wrap = require('../');

test('run bundle', function(t) {
  var options = {
    code: '([1234, _, moment]);',
    exports: 'a',
    dependencies: [
      {name: 'lodash', exports: '_'},
      {name: 'moment'}
    ]
  };

  var expected = [1234, 'lodash', 'moment'];

  wrap(options, function(err, code) {
    test('in global environment', function(t) {
      t.plan(1);

      var a;
      var sandbox = {_: 'lodash', moment: 'moment'};
      vm.runInNewContext(code, sandbox);
      a = sandbox.a;

      t.deepEqual(a, expected);
      t.end();
    });

    test('in commonjs environment', function(t) {
      t.plan(1);

      var a;
      var sandbox = {
        exports: {},
        module: {},
        require: function(name) { return name; }
      };
      vm.runInNewContext(code, sandbox);
      a = sandbox.module.exports;

      t.deepEqual(a, expected);
      t.end();
    });

    test('in amd environment', function(t) {
      t.plan(1);

      var a;
      var sandbox = {
        define: function(deps, factory) { a = factory.apply(null, deps); }
      };
      sandbox.define.amd = true;
      vm.runInNewContext(code, sandbox);

      t.deepEqual(a, expected);
      t.end();
    });

    t.end();
  });
});