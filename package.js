Package.describe({
  name: 'alexche:autoform-froala-editor',
  version: '0.0.4',
  summary: 'Froala V2 WYSIWYG editor for autoform with templating ability and S3 image upload',
  git: '',
  documentation: 'README.md'
});
Npm.depends({ "busboy": "0.2.9" });

Package.onUse(function(api) {
  api.use(['lepozepo:s3@5.1.5','froala:editor@2.0.1_1','templating@1.0.0',
    'aldeed:autoform@5.7.1','iron:router@1.0.12'],['client', 'server']);
  api.addFiles(['afFroalaEditor.html','afFroalaEditor.js'],'client');
  api.addFiles(['imageUpload.js'],'server'); // there is a bug with Router.onBeforeAction
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('alexche:autoform-froala-editor');
});