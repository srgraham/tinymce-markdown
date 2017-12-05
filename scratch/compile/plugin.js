/*jsc
["tinymce.plugins.markdown.Plugin","tinymce.core.PluginManager","tinymce.plugins.markdown.core.Convert","global!tinymce.util.Tools.resolve","tinymce.core.util.Tools"]
jsc*/
defineGlobal("global!tinymce.util.Tools.resolve", tinymce.util.Tools.resolve);
/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.PluginManager',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.PluginManager');
  }
);

/**
 * ResolveGlobal.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.util.Tools',
  [
    'global!tinymce.util.Tools.resolve'
  ],
  function (resolve) {
    return resolve('tinymce.util.Tools');
  }
);

/**
 * Convert.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.markdown.core.Convert',
  [
    'tinymce.core.util.Tools'
  ],
  function (Tools) {
    var html2markdown = function (s) {


      var escape = function(str){
        return str.replace(/([\\`*_{}[\]()#+.!-]|&gt;)/gi, '\\$1');
      };

      // force html to be valid
      var div = document.createElement('div');
      div.innerHTML = s;

      function walkChildren(node, join){
        if(typeof join === 'undefined'){
          join = true;
        }
        var out = [];

        node.childNodes.forEach(function(child_node){
          out.push(walkNode(child_node));
        });

        if(!join){
          return out;
        }

        return out.join('');
      }

      function walkNode(node){
        switch(node.nodeName.toLowerCase()){
          case 'strong':
          case 'b':
            return '**' + walkChildren(node) + '**';

          case 'em':
          case 'i':
            return '*' + walkChildren(node) + '*';

          case 'a':
            return '[' + walkChildren(node) + '](' + escape(node.href) + ')';

          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            var out = '';
            var octothorps = parseInt(node.nodeName.slice(1), 10)
            for(var i = 0; i < octothorps; i += 1) {
              out += '#';
            }
            return out + ' ' + walkChildren(node) + '';

          case 'br':
            return "\n";

          case 'p':
            return walkChildren(node) + "\n";
            break;

          case 'pre':
            return '``' + walkChildren(node) + '``';

          case 'code':
            return '`' + node.textContent + '`';

          case 'ul':
            var ul_out = [];
            var add_spaces = false;
            // add spaces to beginning of each if its a child of another list
            if(node.parentNode.nodeName.toLowerCase() === 'li'){
              add_spaces = true;
            }

            node.childNodes.forEach(function(child_node){
              if(child_node.nodeName.toLowerCase() !== '#text'){
                ul_out.push('* ' + walkChildren(child_node));
              }
            });

            if(node.parentNode.nodeName.toLowerCase() === 'li'){
              for(var i = 0; i < ul_out.length; i += 1){
                var sub_lines = ul_out[i].split("\n");
                for(var j=0; j < sub_lines.length; j+=1){
                  sub_lines[j] = '  ' + sub_lines[j];
                }
                ul_out[i] = sub_lines.join('\n');
              }
            }

            return ul_out.join('\n');

          case 'blockquote':
            var lines = walkChildren(node).split("\n");
            for(var i=0; i < lines.length; i+=1){
              lines[i] = '> ' + lines[i];
            }

            return lines.join("\n");

          case 'div':
            return walkChildren(node);

          case '#text':
            return escape(node.textContent);
        }
        console.log('couldnt walk', node);
        throw new Error("couldnt walk " + node.nodeName);
      }

      var out = walkNode(div);
      return out;

    };

    var markdown2html = function (s) {
      var md = markdownit({
        html: true
      });

      return md.render(s);
    };

    return {
      html2markdown: html2markdown,
      markdown2html: markdown2html
    };
  }
);
/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.markdown.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.plugins.markdown.core.Convert'
  ],
  function (PluginManager, Convert) {
    PluginManager.add('markdown', function () {
      return {
        init: function (editor) {
          editor.on('beforeSetContent', function (e) {
            e.content = Convert.markdown2html(e.content);
          });

          editor.on('postProcess', function (e) {
            if (e.set) {
              e.content = Convert.markdown2html(e.content);
            }

            if (e.get) {
              e.content = Convert.html2markdown(e.content);
            }
          });
        }
      };
    });

    return function () { };
  }
);