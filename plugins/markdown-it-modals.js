// Process block-level custom containers
//
'use strict';


module.exports = function container_plugin(md, options) {

  function validateOpen(params) {
	var regex = /^\{modal\[(.*)\]\:(.*)\}$/gm;
	return regex.exec(params.trim());
  }
  
  function validateClose(params) {
	var regex = /^\{modal\}$/gm;
	return params.trim().match(regex);
  }

  function render(tokens, idx, _options, env, self) {
    // add a class to the opening tag
    if (tokens[idx].nesting === 1) {
    	tokens[idx].attrPush([ 'class', 'modal' ]);
    	if (tokens[idx].hasOwnProperty('modalOptions')) {
	    	tokens[idx].attrPush([ 'id', tokens[idx].modalOptions.id ]);
    	}
    }
    return self.renderToken(tokens, idx, _options, env, self);
  }
  
  /*
  <div class="modal-dialog" role="document">
  	<div class="modal-content">
	  <div class="modal-header">
		<button type="button" class="close" data-dismiss="modal" aria-label="Close">
		  <span aria-hidden="true">&times;</span>
		</button>
		<h4 class="modal-title"></h4>
	  </div>
	  <div class="modal-body"></div>
    </div>
  </div>
  */
  function buildModal(state, title, startLine, nextLine) {
  	// <div class="modal-dialog" role="document">
	var modalDialog = state.push('modal-dialog_open', 'div', 1);
	modalDialog.attrs = [['class', 'modal-dialog'], ['role', 'document']];
		// <div class="modal-content">
		var modalContent = state.push('modal-content_open', 'div', 1);
		modalContent.attrs = [['class', 'modal-content']];
			// <div class="modal-header">
			var modalHeader = state.push('modal-header_open', 'div', 1);
			modalHeader.attrs = [['class', 'modal-header']];
				// <button type="button" class="close" data-dismiss="modal" aria-label="Close">
				var modalButton = state.push('modal-button_open', 'button', 1);
				modalButton.attrs = [['type', 'button'], ['class', 'close'], ['data-dismiss', 'modal'], ['aria-label', 'Close']];
					// <span aria-hidden="true">&times;</span>
					var closeSpan = state.push('modal-close', 'span', 0);
					closeSpan.attrs = [['aria-hidden', 'true']];
						var closeSpanContent = state.push('inline', '', 0);
						closeSpanContent.content = '&times;';
						closeSpanContent.children = [];
				state.push('modal-button_close', 'button', -1);
				// <h4 class="modal-title"></h4>
				var modalTitle = state.push('modal-title_open', 'h4', 1);
				modalTitle.attrs = [['class', 'modal-title']];
					var modalTitleContent = state.push('inline', '', 1);
					modalTitleContent.content = title;
					modalTitleContent.children = [];
				state.push('modal-title_close', 'h4', -1);
			state.push('modal-header_close', 'div', -1);
			// <div class="modal-body">
			var modalBody = state.push('modal-body_open', 'div', 1);
			modalBody.attrs = [['class', 'modal-body']];
				// Modal content
			    state.md.block.tokenize(state, startLine + 1, nextLine);
		    state.push('modal-body_close', 'div', -1);
		state.push('modal-content_close', 'div', -1);
	state.push('modal-dialog_close', 'div', -1);
	//END ADD
  }

  options = options || {};

  var marker_str  = '{modal',
      marker_char = marker_str.charCodeAt(0);

  function container(state, startLine, endLine, silent) {
    var auto_closed = false;
	var start = state.bMarks[startLine] + state.tShift[startLine];
	var max = state.eMarks[startLine];

    // Check out the first character quickly,
    // this should filter out most of non-containers
    //
    if (marker_char !== state.src.charCodeAt(start)) { return false; }
    
    var params = state.src.slice(start, max);
    var matches = validateOpen(params);
    if (!matches || matches.length < 3) { return false; }
    
    // Since start is found, we can report success here in validation mode
    if (silent) {return true;}
    
    var modalOptions = {
    	id: matches[1],
    	title: matches[2]
    };
    
    // Search for the end of the block
    //
    var nextLine = startLine;

    for (;;) {
      nextLine++;
      if (nextLine >= endLine) {
        // unclosed block should be autoclosed by end of document.
        // also block seems to be autoclosed by end of parent
        break;
      }

      start = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];
      
	  params = state.src.slice(start, max);
      if (!validateClose(params)) { continue; }

      // found!
      auto_closed = true;
      break;
    }
	
    var old_parent = state.parentType;
    var old_line_max = state.lineMax;
    state.parentType = 'container';

    // this will prevent lazy continuations from ever going past our end marker
    state.lineMax = nextLine;

    var token        = state.push('modal_open', 'div', 1);
    token.block  = true;
    token.info   = params;
    token.map    = [ startLine, nextLine ];
    token.modalOptions = modalOptions;
    
    //Building the modal
	buildModal(state, modalOptions.title, startLine, nextLine);

    token        = state.push('modal_close', 'div', -1);
    token.markup = state.src.slice(start);
    token.block  = true;

    state.parentType = old_parent;
    state.lineMax = old_line_max;
    state.line = nextLine + (auto_closed ? 1 : 0);

    return true;
  }

  md.block.ruler.before('fence', 'modal', container, {
    alt: [ 'paragraph', 'reference', 'blockquote', 'list' ]
  });
  md.renderer.rules['modal_open'] = render;
  md.renderer.rules['modal_close'] = render;
  
  // Handle the link tags
  var defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  md.renderer.rules['link_open'] = function (tokens, idx, options, env, self) {
	// If you are sure other plugins can't add `target` - drop check below
	var aIndex = tokens[idx].attrIndex('href');

	if (aIndex >= 0) {
	  var value = tokens[idx].attrs[aIndex][1];
	  var regex = /^modal\:(.*)$/gm;
	  var target = regex.exec(value.trim());
	  if (target) {
	    tokens[idx].attrPush(['data-target', '#' + target[1]]);
	    tokens[idx].attrPush(['data-toggle', 'modal']);
	  }
	}

	// pass token to default renderer.
	return defaultRender(tokens, idx, options, env, self);
  };
};
