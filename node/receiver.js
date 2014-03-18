var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    os = require('os'),
    url = require('url'),
    /* easyimg = require('easyimage'), */
    inspect = require('util').inspect,
    Busboy = require('busboy'),
    /* App State */
    thumbConfigs = {},
    port = 8000,
    baseUrl = 'http://localhost:8085/';

    // Init the two simple config tests
    initAltConfig();
    initThreeJSConfig()

function initThreeJSConfig() {
    fs.readFile(__dirname + '/examples.js', { encoding: 'utf8' }, function(err, data) {

      if(!err) {
        thumbConfigs['threejs'] = {
            postTo: 'http://localhost:8000/',
            pages: flattenGroups(JSON.parse(data))
        }
      }

    });
    
    function flattenGroups(groupedExamples) {

        // Flatten and store file names of Three.js examples - they are grouped in examples.js
        // by category. Remove the grouping and return an array of page urls
        var pages = [];

        for (var f in groupedExamples) {
            var items = groupedExamples[f];

            for (var i = 0, length = items.length; i < length; i++) {
                pages.push( [items[i], baseUrl + 'examples/' + items[i] + '.html'] );
            }
        }
        
        return pages;
    }

}

// Test the ability to push unique urls to the chrome extension to drive thumbnail captures
function initAltConfig() {

    var files = '05-motormount_short.stl;Arduino_Mega_8mm_Mount001.stl;Arduino_Mount_M6.stl;biggearmod_fixed_1.stl;Danaher-DEFAULT.stl;gah.stl;gregs-wade-v5-mrice-idler-for-M4screws.stl;INGENTIS cut up w-color.stl;MinecraftSupports.stl;NEMA 17.STL;No_Bobbin_XY_A.stl;nuttrap.stl;Plate 6 - Wolf Extruder.stl;Power_Supply_Cover.stl;ramps_14_for_i3_box.stl;Ramps_Mount_with_3DR-Simple-GOYO-Spool-Holder.STL;smallgearmod_fixed_1 (1).stl;smallgearmod_fixed_1.stl;Top_1.stl;Untitled.stl;uploads-55-0a-c1-99-1f-3d_print_screw_hole_test.stl;yourMesh.stl'.split(';');

    thumbConfigs['mydocs'] = {
        postTo: 'http://localhost:8000/',
        pages: files.map(function(f) {
            return [f, 'http://localhost:8085/editor/?stl=' + f];
        })
    };

}

http.createServer(function (req, res) {
    console.log('-------- [ createServer] -------------');

	if (req.method === 'POST') {

		var infiles = 0,
			outfiles = 0,
			busboy = new Busboy({ headers: req.headers });

		console.log('\r\n -----[ Inbound Post ]----- ');

		busboy.on('field', function (fieldname, value, valueTruncated, fieldnameTruncated) {

			// The value variable starts with leading MIME header information. When we make the call to the
			// base64 decode function, we need to strip off the leading meta data
			var buffer = new Buffer(value.substr(22), 'base64');

			onFile(buffer, req.headers['tjs-name'], function () {

					console.log('All parts written to disk');
					res.writeHead(200, { 'Connection': 'close' });
					res.end("That's all folks!");
			});

		});

		busboy.once('end', function () {
			console.log('Done parsing form!');
		});

		req.pipe(busboy);

	} else if (req.method === 'GET') {

        var pathname = url.parse(req.url).pathname;
        
        if (pathname == '/threejs-pages') {

            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(JSON.stringify(thumbConfigs['threejs']));
            res.end();

        } else if (pathname == '/mydocs-pages') {

            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(JSON.stringify(thumbConfigs['mydocs']));
            res.end();

        } else {
            res.writeHead(200, { Connection: 'close' });
            res.end('<html><head></head><body>\
            Listening on' + port + '\
            </body>');
        }
	}
}).listen(port, function () {
	console.log('Listening for requests -  Port:' + port);
});

var re = /[\.\\\/]+/g;

function onFile(data, filename, next) {

	var file = [__dirname, '../generated', filename.replace(re, '') + '.jpg'].join(path.sep);
	console.log('Write to file: ' + file);

	var fstream = fs.createWriteStream(file);

	fstream.once('close', function () {
		console.log(filename + ' written to disk');
		next();
	});

	console.log('(' + filename + ') start saving');

	fstream.end(data);
}

