'use strict';

var Plugin = require('markdown-it-container');

module.exports = function bootstrap_alert_plugin(md) {
  md.use(Plugin, 'alert-success', alertOptions('success'));
  md.use(Plugin, 'alert-warning', alertOptions('warning'));
  md.use(Plugin, 'alert-danger', alertOptions('danger'));
  md.use(Plugin, 'alert-info', alertOptions('info'));
};

function alertOptions(name) {
  return {
    validate: function(params) {
      var regex = new RegExp('^alert-' + name + '+(.*)$');
      return params.trim().match(regex);
    },
    render: function(tokens, idx, _options, env, self) {
      // add a class to the opening tag
      if (tokens[idx].nesting === 1) {
        tokens[idx].attrPush([ 'class', 'alert alert-' + name ]);
      }
      return self.renderToken(tokens, idx, _options, env, self);
    }
  }
}