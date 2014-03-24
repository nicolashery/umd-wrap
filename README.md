# umd-wrap

[![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

Wrap a block of code into a [UMD](https://github.com/umdjs/umd) bundle, with the option to define external dependencies.

The resulting bundle can be used with [Node](http://nodejs.org/), [Browserify](http://browserify.org/), [RequireJS](http://requirejs.org/), or simply via the `window` object.

## Install

```bash
$ npm install git://github.com/nicolashery/umd-wrap.git
```

## Usage

```javascript
// make-bundle.js
var wrap = require('umd-wrap');

var options = {
  code: '(function() { console.log(\'hello world\'); });',
  exports: 'robot',
  dependencies: [
    {name: 'lodash', exports: '_'},
    {name: 'moment'}
  ]
};

wrap(options, function(err, code) {
  console.log(code);
});
```

```bash
$ node make-bundle > bundle.js
```

```javascript
// output
(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(require('lodash'), require('moment'));
  }
  else if (typeof define === 'function' && define.amd) {
    define(['lodash', 'moment'], factory);
  }
  else {
    root['robot'] = factory(root['_'], root['moment']);
  }
}(this, function(_, moment) {
  function _requireDep(name) {
    return {'lodash': _, 'moment': moment}[name];
  }

  var _bundleExports = (function() { console.log('hello world'); });

  return _bundleExports;
}));
```

## Options

```javascript
{
  code: '(function() { console.log(\'hello world\'); });',
  // Block of code to wrap
  // Needs to return what needs to be exported,
  // and be assignable to a variable (hint: wrap it in parentheses)

  exports: 'robot',
  // Name to expose on the `window` object

  dependencies: [
    {name: 'lodash', exports: '_'},
    {name: 'moment'}
  ],
  // Optional list of external dependencies required in wrapped block of code
  // If one exposes a different name on the `window` object, use `exports`

  quoteChar: '\'',
  // Quote character used in your `require()` statements
  // Default: (')

  headTemplate: path.join(__dirname, 'templates/head.js'),
  // Lo-Dash template used to create the UMD bundle head
  // Change only if you need a custom one

  tailTemplate: path.join(__dirname, 'templates/tail.js'),
  // Lo-Dash template used to create the UMD bundle tail
  // Change only if you need a custom one

  requireDepFunctionName: '_requireDep',
  // Name of function used to require external dependencies
  // Override only if you are already using that name

  bundleExportsVariableName: '_bundleExports'
  // Name of variable used to return bundle exports
  // Override only if you are already using that name
}
```

## Use with pure-cjs

See [https//github.com/nicolashery/cjs-umd](https//github.com/nicolashery/cjs-umd).

## Use with Browserify

(**Hack**, could be automated)

```bash
$ npm install -g browserify
```

Go through your source files (you can make a copy of the whole tree), and replace any external dependency `require()` statements with `_requireDep()`, for example:

```javascript
var _ = require('lodash');
// becomes...
var _ = _requireDep('lodash');
```

Create a Browserify bundle, exporting your main module:

```bash
$ browserify -r ./index.js:robot index.js > robot.js
```

It will look something like this:

```javascript
require=(function e(t,n,r){
  // a bunch of code...
},{},["H99CHA"])
```

Remove the `require=`, and call the whole block with your module name, for example:

```javascript
(function e(t,n,r){
  // a bunch of code...
},{},["H99CHA"])('robot');
```

Replace every `require` with `_require` (this is to be able to use this bundle into another Browserified source):

```bash
$ sed "s/require/_require/g" robot.js > robot.js
# We replaced our `_requireDep` too, so change them back
$ sed "s/__requireDep/_requireDep/g" robot.js > robot.js
```

Wrap the resulting block of code with `umd-wrap`.

## License

MIT

[travis-image]: https://travis-ci.org/nicolashery/umd-wrap.png?branch=master
[travis-url]: https://travis-ci.org/nicolashery/umd-wrap
[daviddm-image]: https://david-dm.org/nicolashery/umd-wrap.png?theme=shields.io
[daviddm-url]: https://david-dm.org/nicolashery/umd-wrap