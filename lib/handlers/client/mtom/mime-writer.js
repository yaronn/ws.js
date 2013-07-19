var fs = require('fs')
require('bufferjs')

var MimeWriter = {
	
  build_multipart_body: function(parts, boundary) {		
    var body = new Buffer('')			
    for (var i in parts) {						
      body = Buffer.concat([body, this.build_part(parts[i], boundary)])
      if (i<parts.length-1) body = Buffer.concat([body, new Buffer('\r\n')])
    }
    return Buffer.concat([body, new Buffer('\r\n' + '--' + boundary + '--')])
  },

  build_part: function(part, boundary) {		
    var return_part = '--' + boundary + "\r\n"
    return_part += "Content-ID: <" + part.id + ">\r\n"	
    return_part += "Content-Transfer-Encoding: " + part.encoding + "\r\n"	
    return_part += "Content-Type: " + part.contentType + "\r\n\r\n"			
    return Buffer.concat([new Buffer(return_part), part.body])
  }
}

exports.build_multipart_body = function(parts, boundary) {
  return MimeWriter.build_multipart_body(parts, boundary)
}