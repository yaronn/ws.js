var utils = require('../../utils')
  , request = require('request')
/** @todo need to cleanup this code, but it is working for now... and I did not write it, so don't judge */
var http = require('http');
var https = require('https');

exports.HttpClientHandler = HttpClientHandler

function HttpClientHandler() {}

HttpClientHandler.prototype.send = function(ctx, callback) {
	var url = require('url').parse(ctx.url);
	var req = https.request({host: url.hostname,
			port: url.port,
			path: url.path,
			method: "POST",
			headers: { "SOAPAction": ctx.action,
					"Content-Type": ctx.contentType,
					"MIME-Version": "1.0",
                          },
			highWaterMark: 5 * 1024,
			rejectUnauthorized: false
               }, 		
               function (res) {
			var data = '';
			res.on('data', function(e) {
				data += e;
			});
			res.on('end', function() {
				ctx.response = data;
				ctx.resp_contentType = res.headers["content-type"]
				ctx.statusCode = res.statusCode
				callback(ctx)
			});

	});

	req.highWaterMark = 5 * 1024;
	req.on('error', function(e) {
		ctx.error = e;
		callback(ctx);
	});

	req.write(ctx.request);

	req.end();
}
