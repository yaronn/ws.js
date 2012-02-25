var select = require('../../xpath').SelectNodes
  , Dom = require('xmldom').DOMParser
  , utils = require('../../utils')

exports.WsAddressingClientHandler = WsAddressingClientHandler

function WsAddressingClientHandler(version) {
  this.version = version		
}

WsAddressingClientHandler.prototype.send = function(ctx, callback) {	
  var self = this
    , doc = new Dom().parseFromString(ctx.request)
    , header = select(doc, "/*[local-name(.)='Envelope']/*[local-name(.)='Header']")[0]
  doc.firstChild.setAttribute("xmlns:ws", this.version)
  utils.appendElement(doc, header, this.version, "ws:Action", ctx.action)
  utils.appendElement(doc, header, this.version, "ws:To", ctx.url)
  utils.appendElement(doc, header, this.version, "ws:MessageID", utils.guid())
  var reply = utils.appendElement(doc, header, this.version, "ws:ReplyTo", null)
  utils.appendElement(doc, reply, this.version, "ws:Address", this.version + "/role/anonymous")
  ctx.request = doc.toString()	
	this.next.send(ctx, function(ctx) { 
    self.receive(ctx, callback)
  })
}

WsAddressingClientHandler.prototype.receive = function(ctx, callback) {		
  callback(ctx)
}