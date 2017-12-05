asynctest(
  'browser.tinymce.plugins.markdown.MarkdownSanityTest',

  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.plugins.markdown.Plugin',
    'tinymce.themes.modern.Theme'
  ],

    function (ApproxStructure, Pipeline, Step, TinyApis, TinyLoader, MarkdownPlugin, ModernTheme) {
      var success = arguments[arguments.length - 2];
      var failure = arguments[arguments.length - 1];

      MarkdownPlugin();
      ModernTheme();

      TinyLoader.setup(function (editor, onSuccess, onFailure) {
        var tinyApis = TinyApis(editor);

        Pipeline.async({}, [
          tinyApis.sSetContent('[b]a[/b]'),
          tinyApis.sAssertContentStructure(ApproxStructure.build(function (s, str) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.element('strong', {
                      children: [
                        s.text(str.is('a'))
                      ]
                    })
                  ]
                })
              ]
            });
          }))
        ], onSuccess, onFailure);
      }, {
        plugins: 'markdown',
        toolbar: 'markdown',
        skin_url: '/project/src/skins/lightgray/dist/lightgray',
        markdown_dialect: 'punbb'
      }, success, failure);
    }
  );
