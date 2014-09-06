(function (root, factory) {
  if (typeof exports === <%= quote %>object<%= quote %>) {
    module.exports = factory(<%= cjsDependencies %>);
  }
  else if (typeof define === <%= quote %>function<%= quote %> && define.amd) {
    define([<%= amdDependencies %>], factory);
  }
  else {
    var globalAlias = <%= quote %><%= globalAlias %><%= quote %>;
    var namespace = globalAlias.split('.');
    var parent = root;
    for ( var i = 0; i < namespace.length-1; i++ ) {
      if ( parent[namespace[i]] === undefined ) parent[namespace[i]] = {};
      parent = parent[namespace[i]];
    }
    parent[namespace[namespace.length-1]] = factory(<%= globalDependencies %>);
  }
}(this, function(<%= dependencyExports %>) {
  function <%= _requireDep %>(name) {
    return {<%= dependencyNameToExportsMapping %>}[name];
  }

  var <%= _bundleExports %> = 