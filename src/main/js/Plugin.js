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