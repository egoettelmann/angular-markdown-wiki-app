// Builds a todo page
//
'use strict';

var fs          = require('fs');
var objectPath  = require("object-path");

module.exports = function todoPageBuilder(md, opts) {
  
  /*
  * Variables
  */
  var _todoItems = {};
  
  /*
  * Adding Markdown-it task-lists listener
  */
  md.core.ruler.after('inline', 'github-task-lists', function(state, startLine, endLine, silent) {
    if (opts.todoRoute && state.env.fileName) {
      var tokens = state.tokens;
      var lastId = 0;
      for (var i = 2; i < tokens.length; i++) {
        var token = tokens[i];
        if (token.content.indexOf('[ ] ') === 0 || token.content.indexOf('[x] ') === 0 || token.content.indexOf('[X] ') === 0) {
          if (!_todoItems.hasOwnProperty(state.env.fileName)) {
            _todoItems[state.env.fileName] = '';
          }
          for (var j = 4; j < token.level; j++) {
            _todoItems[state.env.fileName] += " ";
          }
          _todoItems[state.env.fileName] += '- ' + token.content + "\r\n";
        }
      }
    }
  });
  
  return {
    /*
    * Write function
    */
    write: function (outputFile) {
      if (opts.todoRoute) {
        var todoFileContent = '# TODO-List' + "\r\n" + "[TOC]" + "\r\n";
        for (var todoKey in _todoItems) {
          todoFileContent += '## ' + todoKey + "\r\n";
          todoFileContent += _todoItems[todoKey];
        }
        fs.writeFile(
          outputFile,
          md.render(todoFileContent)
        );
      }
    }
  }
};
