var select = require('../../../xpath').SelectNodes
  , Dom = require('xmldom').DOMParser
  , utils = require('../../../utils')
  , writer = require('../../../../lib/handlers/client/mtom/mime-writer.js')
  , reader = require('../../../../lib/handlers/client/mtom/mime-reader.js')
require('bufferjs')

exports.MtomClientHandler = MtomClientHandler

function MtomClientHandler() {}

MtomClientHandler.prototype.send = function(ctx, callback) {	
  var self = this
  boundary = "my_unique_boundary"
  var parts = [{ id: "part0", 
                 contentType: 'application/xop+xml;charset=utf-8;type="'
                   +ctx.contentType+'"', 
		             encoding: "8bit"
		           }]		
  var doc = new Dom().parseFromString(ctx.request)
  
  for (var i in ctx.base64Elements) {		
    var file = ctx.base64Elements[i]
		  , elem = select(doc, file.xpath)[0]
      , binary = new Buffer(elem.firstChild.data, 'base64')		
		  , id = "part" + (parseInt(i)+1)
    
    parts.push({ id: id
               , contentType: file.contentType
               , body: binary
               , encoding: "binary"
               })

    //put an xml placeholder
    elem.removeChild(elem.firstChild)
    utils.appendElement(doc, elem, "http://www.w3.org/2004/08/xop/include", "xop:Include")
    elem.firstChild.setAttribute("xmlns:xop", "http://www.w3.org/2004/08/xop/include")
    elem.firstChild.setAttribute("href", "cid:" + id)
  }

  parts[0].body = new Buffer(doc.toString())
  ctx.contentType = 'multipart/related; type="application/xop+xml";start="<part0>";boundary="'+boundary+'";start-info="'
    + ctx.contentType +'"; action="'+ctx.action+'"'
  ctx.request = writer.build_multipart_body(parts, boundary)

  this.next.send(ctx, function(ctx) {
    self.receive(ctx, callback)
  })
}

MtomClientHandler.prototype.receive = function(ctx, callback) {

  if (!ctx.resp_contentType) {
    console.log("warning: no content type in response")
    callback(ctx)
    return
  }

  var boundary = utils.parseBoundary(ctx.resp_contentType)
  if (!boundary) {
    console.log("warning: no boundary in response")
    callback(ctx)
    return
  }

  //use slice() since in http multipart response the first chars are #13#10 which the parser does not expect
  var parts = reader.parse_multipart(ctx.response.slice(2), boundary)

  if (parts.length==0) {
    console.log("warning: no mime parts in response")
    callback(ctx)
    return
  }

  var doc = new Dom().parseFromString(parts[0].data.toString())	

  for (var i in parts) {
    var p = parts[i]
      , id = utils.extractContentId(p.headers["content-id"] )
      , xpath = "//*[@href='cid:" + encodeURIComponent(id) + "']//parent::*"		
      , elem = select(doc, xpath)[0]

    if (!elem) continue		
    elem.removeChild(elem.firstChild)
    utils.setElementValue(doc, elem, p.data.toString("base64"))
  }			
  ctx.response = doc.toString()
  callback(ctx)
}

