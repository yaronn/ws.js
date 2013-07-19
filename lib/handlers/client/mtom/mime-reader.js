var MultipartParser = require('formidable/lib/multipart_parser.js').MultipartParser
  , fs = require('fs')
require('bufferjs')

var MimeReader = {

  parse_multipart: function(payload, boundary) {
    var parts = []
    var part
    var data
    var headers = []
    var curr_header_name
    var curr_header_value

    var parser = new MultipartParser()
    parser.initWithBoundary(boundary)

    parser.onPartBegin = function() {
      part = {}
      headers = []
      curr_header_name = ""
      curr_header_value = ""
      data = new Buffer('')
    }

    parser.onHeaderField = function(b, start, end) {
      curr_header_name = b.slice(start, end).toString()
    };

    parser.onHeaderValue = function(b, start, end) {
      curr_header_value = b.slice(start, end).toString()
    }

    parser.onHeaderEnd = function() {
      headers[curr_header_name.toLowerCase()] = curr_header_value
    }

    parser.onHeadersEnd = function() { }

    parser.onPartData = function(b, start, end) {
      data = Buffer.concat([data, b.slice(start, end)])
    }

    parser.onPartEnd = function() {
      part.data = data
      part.headers = headers
      parts.push(part)
    }

    parser.onEnd = function() {}
    parser.write(payload)	
    return parts
  },	
}

exports.parse_multipart = function(payload, boundary)
{
  return MimeReader.parse_multipart(payload, boundary)
}