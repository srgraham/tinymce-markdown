/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.markdown.api.Settings',
  [
  ],
  function () {
    var getDialect = function (editor) {
      // Note: This option isn't even used since we only support one dialect
      return editor.getParam('markdown_dialect', 'punbb').toLowerCase();
    };

    return {
      getDialect: getDialect
    };
  }
);