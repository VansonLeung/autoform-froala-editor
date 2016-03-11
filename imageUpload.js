Busboy = Npm.require('busboy');

Router.route("/upload_image_froala", {
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
        var client, fs, name, pf, req, rsp, source;
        pf = this.request.files[0].name.split(".");
        pf = pf.pop();
        name = Random.id()  + "." + pf;
        if (Meteor.isServer) {
            fs = Npm.require('fs');
            source = this.request.files[0].data;
            client = S3.knox;
            req = client.put("froala/"+name, {
                'Content-Length': source.length,
                'x-amz-acl': 'public-read'
            });
            rsp = this.response;
            req.on('response', function(res) {

                if (200 === res.statusCode) {
                    rsp.writeHead(200, {
                        'Content-Type': 'text/json'
                    });
                    return rsp.end(JSON.stringify({
                        link: req.url
                    }));
                }
            });
            return req.end(source);
        }
    }
});
