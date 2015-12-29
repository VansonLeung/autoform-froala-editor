Package.describe({
  name: 'alexche:autoform-froala-editor',
  version: '0.0.4',
  // Brief, one-line summary of the package.
  summary: 'Froala editor for aldeed:autoform with S3 image uploader',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.use(['lepozepo:s3','froala:editor@2.0.5','templating',
    'aldeed:autoform','iron:router'],['client', 'server']);
  api.addFiles(['afFroalaEditor.html','afFroalaEditor.js'],'client');
  api.addFiles(['imageUpload.js'],'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('alexche:autoform-froala-editor');
});
