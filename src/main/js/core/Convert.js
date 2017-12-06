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
      div.innerHTML = s.replace(/\r?\n/g, '');

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
          // strong/b immediately followed by em/i needs *** and vice versa
          // strong/b inside strong/b get collapsed. same with em/i
          case 'strong':
          case 'b':
            if(node.childNodes.length === 1){
              switch(node.childNodes[0].nodeName.toLowerCase()){
                case 'em':
                case 'i':
                  return '**' + walkNode(node.childNodes[0]) + '**';
                case 'strong':
                case 'b':
                  return walkNode(node.childNodes[0]);
              }
            }
            return '**' + walkChildren(node) + '**';

          case 'em':
          case 'i':
            if(node.childNodes.length === 1){
              switch(node.childNodes[0].nodeName.toLowerCase()){
                case 'strong':
                case 'b':
                  return '*' + walkNode(node.childNodes[0]) + '*';
                case 'em':
                case 'i':
                  return walkNode(node.childNodes[0]);
              }
            }
            return '*' + walkChildren(node) + '*';

          case 'a':
            return '[' + walkChildren(node) + '](' + escape(node.href) + ')';

          case 'img':
            return '![' + node.alt + '](' + escape(node.src) + ')';

          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            var out = '';
            var octothorps = parseInt(node.nodeName.slice(1), 10);
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

            return '\n' + ul_out.join('\n').replace(/\s+$/, '') + '\n';

          case 'blockquote':
            var lines = walkChildren(node).split("\n");
            for(var i=0; i < lines.length; i+=1){
              lines[i] = '> ' + lines[i];
            }

            return lines.join("\n");

          case 'hr':
            return '\n---\n';

          case 'table':
            return walkChildren(node);

          case 'thead':
            var children = walkChildren(node.childNodes[0], false);
            var out = '';
            for(var i = 0; i < children.length; i+=1){
              out += '|-';
            }
            out += "|\n";
            return walkChildren(node) + out;

          case 'tr':
            var children = walkChildren(node, false);
            return '| ' + children.join(' | ') + ' |\n';

          case 'tbody':
          case 'td':
          case 'th':
            return walkChildren(node);

          case 'div':
            return walkChildren(node);

          case '#text':
            return escape(node.textContent);
        }
        console.log('couldnt walk', node);
        throw new Error("couldnt walk " + node.nodeName);
      }

      var out = walkNode(div);
      out = out.replace(/\n[\u0020\u00a0]?((?:\n[\u0020\u00a0])+)/g, function(z, linefeeds){
        return linefeeds.replace(/\n[\u0020\u00a0]?/g, "\n\\");
      });
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