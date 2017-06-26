Package.describe({
  name: 'nwa-daterangepicker',
  version: '1.0.0',
  summary: 'Daterangepicker based on Dan Grossman\'s bootstrap-daterangepicker.',
  git: 'https://github.com/NewsWhip/nwa-daterangepicker.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.0.1');

  api.use('twbs:bootstrap@3.3.4', ["client"], {weak: true});
  api.use('momentjs:moment@2.10.3', ["client"]);
  api.use('jquery@1.11.3_2', ["client"]);

  api.addFiles('daterangepicker.js', ["client"]);
  api.addFiles('daterangepicker.css', ["client"]);
});
