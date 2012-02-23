var select = require('../../xpath').SelectNodes;
var Dom = require('xmldom').DOMParser;
var utils = require('../../utils');

exports.WsAddressingClientHandler = WsAddressingClientHandler;

function WsAddressingClientHandler(version) {
	this.version = version;		
}

WsAddressingClientHandler.prototype.send = function(ctx, callback) {
	
	var self = this;

	var doc = new Dom().parseFromString(ctx.request);
	doc.firstChild.setAttribute("xmlns:ws", this.version);
	var header = select(doc, "/*[local-name(.)='Envelope']/*[local-name(.)='Header']")[0];

	utils.addElement(doc, header, this.version, "ws:Action", ctx.action);
	utils.addElement(doc, header, this.version, "ws:To", ctx.url);
	utils.addElement(doc, header, this.version, "ws:MessageID", utils.guid());
	var reply = utils.addElement(doc, header, this.version, "ws:ReplyTo", null);
	utils.addElement(doc, reply, this.version, "ws:Address", this.version + "role/anonymous");

	ctx.request = doc.toString();
	
	this.next.send(
			ctx, 
			function(ctx) { 
				self.receive(ctx, callback); 
			});
}

WsAddressingClientHandler.prototype.receive = function(ctx, callback) {		
	callback(ctx);
}
