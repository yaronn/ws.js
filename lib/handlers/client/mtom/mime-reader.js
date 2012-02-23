var MultipartParser = require('formidable/lib/multipart_parser.js').MultipartParser;
var fs = require('fs');
require('bufferjs');

var MimeReader = {
	

	parse_multipart: function(payload, boundary) {

		var parts = [];
		var part;
		var data;
		var headers = [];
		var curr_header_name;
		var curr_header_value;

		var parser = new MultipartParser();
		parser.initWithBoundary(boundary);


		parser.onPartBegin = function() {
			part = {};
			headers = [];
			curr_header_name = "";
			curr_header_value = "";
			data = new Buffer('');

			console.log("onPartBegin");
		};

		parser.onHeaderField = function(b, start, end) {
			curr_header_name = b.slice(start, end).toString();

			console.log("onHeaderField");
		};

		parser.onHeaderValue = function(b, start, end) {
			curr_header_value = b.slice(start, end).toString();

			console.log("onHeaderValue");
		};

		parser.onHeaderEnd = function() {
			headers[curr_header_name.toLowerCase()] = curr_header_value;

			console.log("onHeaderEnd");
		};

		parser.onHeadersEnd = function() {
			console.log("onHeadersEnd");
		};

		parser.onPartData = function(b, start, end) {
			console.log("onPartData");

			data = Buffer.concat(data, b.slice(start, end));
		};

		parser.onPartEnd = function() {
			part.data = data;
			part.headers = headers;
			parts.push(part);

			console.log("onPartEnd");
		};

		parser.onEnd = function() {
			console.log("onEnd");
		};

		parser.write(payload);	

		return parts;
	},	

}

exports.parse_multipart = function(payload, boundary)
{
	return MimeReader.parse_multipart(payload, boundary);
}