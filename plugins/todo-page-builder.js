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
            objectPath.set(_todoItems, state.env.fileName, '');
          }
          var indent = "";
          for (var j = 4; j < token.level; j++) {
            indent += " ";
          }
          objectPath.set(_todoItems, state.env.fileName, objectPath.get(_todoItems, state.env.fileName) + indent + '- ' + token.content + "\r\n");
        }
      }
    }
  });
  
  function nestedTodo(object, titlePrefix) {
    var todoFileContent = '';
    for (var todoKey in object) {
      todoFileContent += titlePrefix + ' ' + todoKey + "\r\n";
      if (typeof object[todoKey] === 'string' || object[todoKey] instanceof String) {
        todoFileContent += object[todoKey];
      } else {
        todoFileContent += nestedTodo(object[todoKey], titlePrefix + "#");
      }
    }
    return todoFileContent;
  }
  
  return {
    /*
    * Write function
    */
    write: function (outputFile) {
      if (opts.todoRoute) {
        var todoFileContent = '# TODO-List' + "\r\n" + "[TOC]" + "\r\n" + nestedTodo(_todoItems, "##");
        fs.writeFile(
          outputFile,
          md.render(todoFileContent)
        );
      }
    }
  }
};
