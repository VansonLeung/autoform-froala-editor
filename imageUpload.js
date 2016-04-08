Busboy = Npm.require('busboy');

Router.route("/upload_image_froala_cfs/:cfs", {
    name: "upload.image.froala",
    where: 'server',
    onBeforeAction: function(req, res, next) {
        var busboy, files, image;
        files = [];
        image = {};
        if (req.method === 'POST') {
            busboy = new Busboy({
                headers: req.headers
            });
            busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                var buffers;
                image.name = filename;
                image.filename = filename;
                image.mimeType = mimetype;
                image.encoding = encoding;
                buffers = [];
                file.on('data', function(data) {
                    buffers.push(data);
                });
                file.on('end', function() {
                    image.data = Buffer.concat(buffers);
                    files.push(image);
                });
            });
            busboy.on('field', function(fieldname, value) {
                req.body[fieldname] = value;
            });
            busboy.on('finish', function() {
                req.files = files;
                next();
            });
            req.pipe(busboy);
        } else {
            this.next();
        }
    },
    action: function() {
        var cfs = this.params.cfs;
        var client, fs, name, pf, req, rsp, source;
        pf = this.request.files[0].name.split(".");
        pf = pf.pop();
        if (Meteor.isServer) {
            // Find Collection FS model
            rsp = this.response;
            var CFS = global[cfs];
            if (CFS) {

                var Future = Npm.require('fibers/future');
                var future = new Future();
                var onComplete = future.resolver();

                var image = this.request.files[0];
                console.log(image);

                var uploadedFile = new FS.File();
                uploadedFile.attachData(image.data, {
                    type: image.mimeType
                }, function(err) {

                    if (err) {
                        console.log(err);
                        return req.end(source);
                    }

                    uploadedFile.name(image.filename);

                    var insertedFile = CFS.insert(uploadedFile, function(err, fileObj) {
                        Meteor.setTimeout(function() {
                            console.log(fileObj.url({brokenIsFine: true}));
                            return rsp.end(JSON.stringify({
                                link: fileObj.url({brokenIsFine: true})
                            }));
                        }, 1000);
                    });
                });
            }
        }
    }
});