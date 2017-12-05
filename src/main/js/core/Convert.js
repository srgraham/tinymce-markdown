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

      function walkChildren(node, join=true){
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
        console.log(9456, node.nodeName)
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
        throw new Error(`couldnt walk ${node.nodeName}`);
      }

      var out = walkNode(div);
      return out;

      return div.innerHTML;



      s = div.innerHTML;

      s = Tools.trim(s);

      var rep = function (re, str) {
        s = s.replace(re, str);
      };



      var escapeNotHtml = function(str) {
        console.log(99999, str)
        var out = '';

        var first_html_index;

        var prev_length;

        while((first_html_index = str.search('<')) !== -1){
          if(str.length === prev_length){
            console.log(out, str);
            throw new Error(`Recursion on escapeNotHtml("${str}", ${str.length}, ${prev_length})`);
          }
          prev_length = str.length;

          out += escape(str.slice(0, first_html_index));

          str = str.slice(first_html_index);

          str = str.replace(/^<([a-z0-9-]+)([^>]*)>((?:.|\n)*?)<\/\1>(.*)$/i, function(z, open_tag, open_attrs, contents, extra){
            // todo: handle open attrs escaping
            open_attrs = open_attrs.replace(/"([^"]+)"="([^"]+)"/i, function(z, key, val){
              return '"' + key + '"="' + escape(val) + '"';
            });

            // FIXME: cant use template string here in my editor for some reason. it makes everything explode
            out += '<' + open_tag + open_attrs + '>' + escapeNotHtml(contents) + '</' + open_tag + '>';
            return extra;
          });
        }

        return out + escape(str);
      };

      // escape everything thats not html
      // escape characters: [ ] \ _ * # - ! ` |  &gt;
      s = escapeNotHtml(s);

      // h1, h2, h3...
      rep(/<h(\d)>(.*?)<\/h\1>/gi, function(z, h_num, contents){
        var out = '';
        for(var i = 0; i < h_num; i += 1){
          out += '#';
        }
        out += ' ' + contents;
        return out;
      });

      // strong
      rep(/<(strong|b)>(.*?)<\/\1>/gi, "**$2**");

      // em
      rep(/<(em|i)>(.*?)<\/\1>/gi, "*$2*");

      // links
      rep(/<a.*?href=\"(.*?)\".*?>(.*?)<\/a>/gi, "[$2]($1)");

      // images
      rep(/<img(.*?)\/?>/gi, function(z, attrs){
        var src = '';
        var alt = '';

        attrs.replace(/"([^"]+)"="([^"]+)"/i, function(z, key, val){
          switch(key.toLowerCase()){
            case 'src':
              src = val;
              break;
            case 'alt':
              alt = val;
              break;
          }
        });

        return '![' + alt + '](' + src + ')'
      });

      // code
      rep(/<pre><code>(.*?)<\/code><\/pre>/gi, "```$1```");
      rep(/<code>(.*?)<\/code>/gi, "`$1`");


      // linefeeds
      // <br> -> \n
      rep(/<br\s*\/?>/gi, "\n");
      rep(/<p.*?>/gi, '');
      rep(/<\/p>/gi, "\n");

      // now handle the harder stuff...

      // ul > li
      // blockquote

      // example: <strong> to [b]


      return s;



      // links

      // images

      // code

      // table

      // blockquotes

      // hr


      // rep(/<font.*?color=\"(.*?)\".*?class=\"codeStyle\".*?>(.*?)<\/font>/gi, "[code][color=$1]$2[/color][/code]");
      // rep(/<font.*?color=\"(.*?)\".*?class=\"quoteStyle\".*?>(.*?)<\/font>/gi, "[quote][color=$1]$2[/color][/quote]");
      // rep(/<font.*?class=\"codeStyle\".*?color=\"(.*?)\".*?>(.*?)<\/font>/gi, "[code][color=$1]$2[/color][/code]");
      // rep(/<font.*?class=\"quoteStyle\".*?color=\"(.*?)\".*?>(.*?)<\/font>/gi, "[quote][color=$1]$2[/color][/quote]");
      // rep(/<span style=\"color: ?(.*?);\">(.*?)<\/span>/gi, "[color=$1]$2[/color]");
      // rep(/<font.*?color=\"(.*?)\".*?>(.*?)<\/font>/gi, "[color=$1]$2[/color]");
      rep(/<span style=\"font-size:(.*?);\">(.*?)<\/span>/gi, "[size=$1]$2[/size]");
      // rep(/<font>(.*?)<\/font>/gi, "$1");
      rep(/<img.*?src=\"(.*?)\".*?\/>/gi, "[img]$1[/img]");
      rep(/<span class=\"codeStyle\">(.*?)<\/span>/gi, "[code]$1[/code]");
      rep(/<span class=\"quoteStyle\">(.*?)<\/span>/gi, "[quote]$1[/quote]");
      rep(/<strong class=\"codeStyle\">(.*?)<\/strong>/gi, "[code][b]$1[/b][/code]");
      rep(/<strong class=\"quoteStyle\">(.*?)<\/strong>/gi, "[quote][b]$1[/b][/quote]");
      rep(/<em class=\"codeStyle\">(.*?)<\/em>/gi, "[code][i]$1[/i][/code]");
      rep(/<em class=\"quoteStyle\">(.*?)<\/em>/gi, "[quote][i]$1[/i][/quote]");
      // rep(/<u class=\"codeStyle\">(.*?)<\/u>/gi, "[code][u]$1[/u][/code]");
      // rep(/<u class=\"quoteStyle\">(.*?)<\/u>/gi, "[quote][u]$1[/u][/quote]");
      // rep(/<\/(strong|b)>/gi, "[/b]");
      // rep(/<(strong|b)>/gi, "[b]");
      // rep(/<\/(em|i)>/gi, "[/i]");
      // rep(/<(em|i)>/gi, "[i]");
      // rep(/<\/u>/gi, "[/u]");
      // rep(/<span style=\"text-decoration: ?underline;\">(.*?)<\/span>/gi, "[u]$1[/u]");
      // rep(/<u>/gi, "[u]");
      rep(/<blockquote[^>]*>/gi, "[quote]");
      rep(/<\/blockquote>/gi, "[/quote]");
      rep(/<p>/gi, "");
      rep(/<\/p>/gi, "\n");
      rep(/&nbsp;|\u00a0/gi, " ");
      rep(/&quot;/gi, "\"");
      rep(/&lt;/gi, "<");
      rep(/&gt;/gi, ">");
      rep(/&amp;/gi, "&");

      return s;
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