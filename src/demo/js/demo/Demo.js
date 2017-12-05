/**
 * Demo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint no-console:0, no-unused-vars: 0 */

define(
  'tinymce.plugins.markdown.demo.Demo',
  [
    'global!document',
    'tinymce.core.EditorManager',
    'tinymce.plugins.markdown.Plugin',
    'tinymce.plugins.code.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (document, EditorManager, MarkdownPlugin, CodePlugin, ModernTheme) {
    MarkdownPlugin();
    CodePlugin();
    ModernTheme();

    return function () {
      document.querySelector('.tinymce').value = '\\*ma**rkdown plu**g*in*\\*';
      document.querySelector('.tinymce').value = `
      
# (GitHub-Flavored) Markdown Editor 

Basic useful feature list:
* asdf
 * **Ctrl_+S** / C_md+S to _savve_ the file
 * Ctrl+Shift+S / Cmd+Shift+S to choose to save as Markdown or HTML
 * Drag and drop a file into here to load it
 * File contents are saved in the URL so you can share files
   * p_d_ p*****p*****
   * d
   * d
   * d
   * d
   * d
     * asdf
       * asdhflk
         - asdfkh\\*\\-\\\\
         - k

\\*ma**rkdown plu**g*in*\\*

I'm no good at writing sample / filler text, so go write something yourself.

> Look, a list!
> 
> > * foo
> > * bar
> >   * baz

And here's \`some\` code! :+1:

\`\`\`javascript
$(function(){
  $('div').html('I am a div.');
});
\`\`\`

This is [on GitHub](https://github.com/jbt/markdown-editor) so let me know if I've b0rked it somewhere.


Props to Mr. Doob and his [code editor](http://mrdoob.com/projects/code-editor/), from which
the inspiration to this, and some handy implementation hints, came.

### Stuff used to make this:

 * [markdown-it](https://github.com/markdown-it/markdown-it) for Markdown parsing
 * [CodeMirror](http://codemirror.net/) for the awesome syntax-highlighted editor
 * [highlight.js](http://softwaremaniacs.org/soft/highlight/en/) for syntax highlighting in output code blocks
 * [js-deflate](https://github.com/dankogai/js-deflate) for gzipping of data to make it fit in URLs

      `;

      EditorManager.init({
        selector: "textarea.tinymce",
        theme: "modern",
        skin_url: "../../../../../skins/lightgray/dist/lightgray",
        plugins: "markdown code",
        toolbar: "markdown code bold italic strikethrough",
        height: 300,
        // verify_html: false,
        init_instance_callback: function (editor) {
          document.querySelector('#output').innerText = editor.getContent();

          editor.on('keyup', function (e) {
            document.querySelector('#output').innerText = editor.getContent();
          });
        }
      });
    };
  }
);