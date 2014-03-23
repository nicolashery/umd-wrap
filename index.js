var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var defaults = {
  code: '();',
  dependencies: [],
  quoteChar: '\'',
  headTemplate: path.join(__dirname, 'templates/head.js'),
  tailTemplate: path.join(__dirname, 'templates/tail.js'),
  requireDepFunctionName: '_requireDep',
  bundleExportsVariableName: '_bundleExports'
};

function applyDefaults(options) {
  return _.extend({}, defaults, options);
}

function checkOptions(options) {
  var required = ['exports'];
  _.forEach(required, function(name) {
    if (!options[name]) {
      throw new Error('`options.' + name + '` is required by UMD wrapper');
    }
  });
}

function templateData(options) {
  var quote = options.quoteChar;

  return {
    cjsDependencies: _.map(options.dependencies, function(dep) {
      return ['require(', quote, dep.name, quote, ')'].join('');
    }).join(', '),

    amdDependencies: _.map(options.dependencies, function(dep) {
      return [quote, dep.name, quote].join('');
    }).join(', '),

    globalAlias: options.exports,

    globalDependencies: _.map(options.dependencies, function(dep) {
      return ['root[', quote, (dep.exports || dep.name), quote, ']'].join('');
    }).join(', '),

    dependencyExports: _.map(options.dependencies, function(dep) {
      return (dep.exports || dep.name);
    }).join(', '),

    dependencyNameToExportsMapping: _.map(options.dependencies, function(dep) {
      return [quote, dep.name, quote, ': ', (dep.exports || dep.name)].join('');
    }).join(', '),

    quote: quote,
    _requireDep: options.requireDepFunctionName,
    _bundleExports: options.bundleExportsVariableName
  };
}

function applyDataToTemplate(data, template) {
  return _.template(template, data);
}

function wrap(options, cb) {
  options = options || {};
  options = applyDefaults(options);
  checkOptions(options);

  var applyTemplate = applyDataToTemplate.bind(null, templateData(options));
  var templatePath = options.headTemplate;
  fs.readFile(templatePath, function(err, template) {
    if (err) {
      return cb(err);
    }

    var head = applyTemplate(template);

    var templatePath = options.tailTemplate;
    fs.readFile(templatePath, function(err, template) {
      if (err) {
        return cb(err);
      }

      var tail = applyTemplate(template);

      var code = [head, options.code, tail].join('');
      cb(null, code);
    });
  });
}

module.exports = wrap;