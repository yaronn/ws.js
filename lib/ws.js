var select = require('./xpath').SelectNodes;
var Dom = require('xmldom').DOMParser;
var fs = require('fs');
var utils = require('./utils');

exports.Http = require('./handlers/client/http.js').HttpClientHandler;
exports.Addr = require('./handlers/client/addressing.js').WsAddressingClientHandler;
exports.Mtom = require('./handlers/client/mtom/mtom.js').MtomClientHandler;
exports.send = send;
exports.addAttachment = addAttachment;
exports.getAttachment = getAttachment;

function send(handlers, context, callback) {

	var h = handlers;
	if (!isArray(handlers))	
		h = handlers.getArray();		
	
	for (i=0; i<h.length-1; i++)	
		h[i].next = h[i+1];	

	h[0].send(context, callback);
}

function isArray(obj) {
	return typeof(obj)=='object' && (obj instanceof Array);
}


function addAttachment(ctx, property, xpath, file, contentType) {
		var prop = eval("ctx." + property);
		var doc = new Dom().parseFromString(prop);		
		var elem = select(doc, xpath)[0];

		content = fs.readFileSync(file).toString("base64");
		
		utils.setElementValue(doc, elem, content);
		
		eval("ctx." + property + " = doc.toString()");
		
		if (!ctx.base64Elements)		
			ctx.base64Elements = [];
		
		ctx.base64Elements.push({xpath: xpath, contentType: contentType});
}

function getAttachment(ctx, property, xpath) {
	

	var prop = eval("ctx." + property);	
	
	var doc = new Dom().parseFromString(prop);		
	var elem = select(doc, xpath)[0];

	return new Buffer(elem.firstChild.data, "base64");	
}
