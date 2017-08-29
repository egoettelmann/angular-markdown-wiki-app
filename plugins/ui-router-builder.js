// Aggregates all files to ui router states
//
'use strict';

var fs          = require('fs');
var objectPath  = require("object-path");
var path        = require('path');

module.exports = function uiRouterBuilder(opts) {
  
  /*
  * Variables
  */
  var _fileTree = opts.additionalRoutes || {};
  var _aboutRoutes = {};
  var _aboutRoutesText = '';
  
  _aboutRoutesText = 'var aboutRoutes = ';
  _aboutRoutes = {};
  if (!opts.disableAbout || opts.disableAbout) {
    _aboutRoutes = {'about': {'markdown-cheatsheet': {}, 'documentation': {}, 'release-notes': {}, 'about': {}}};
  }
  _aboutRoutesText += JSON.stringify(_aboutRoutes, null, "\t");
  
  return {
    /*
    * Gather function
    */
    gather: function (file) {
      var fileInfo = path.parse(file.path);
      var fileName = path.basename(fileInfo.base, '.html');
      var pathList = [];
      var relPath = path.relative('./resources/content/', fileInfo.dir);
      if (relPath !== '') {
        pathList = relPath.split(path.sep);
      }
      pathList.push(fileName);
      objectPath.set(_fileTree, pathList, {});
      return;
    },
    
    /*
    * Write function
    */
    write: function (outputFile) {
      fs.writeFile(
        outputFile, 
        'var defaultRoute = "' + opts.defaultRoute + '";var routes = ' + JSON.stringify(_fileTree, null, "\t") + ';' + _aboutRoutesText
      );
    }
  }
};
