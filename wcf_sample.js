var ws = require('./lib/ws.js');
var wcf = require('./lib/proxies/wcf.js');
var assert = require('assert')
var fs = require('fs')


var request = 
'<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">' +
'<s:Body>' +
'<EchoFiles xmlns="http://tempuri.org/">' +
'<value xmlns:a="http://schemas.datacontract.org/2004/07/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">' +
'<a:File1 />' +
'<a:File2 />' +
'</value>' +
'</EchoFiles>' +
'</s:Body>' +
'</s:Envelope>';

var ctx = {
	request: request, 
	contentType: "application/soap+xml",
	url: "http://localhost:7171/Service/mtom",	
	action: "http://tempuri.org/IService/EchoFiles"
};	

ws.addAttachment(ctx, "request", "//*[local-name(.)='File1']", "./test/unit/client/files/p.jpg", "image/jpeg");
ws.addAttachment(ctx, "request", "//*[local-name(.)='File2']", "C:/temp/ubuntu.PNG", "text/xml");



var binding = 	new wcf.BasicHttpBinding(
	{							
		MessageEncoding: "Mtom"
	});


/*

//OR:
	
var binding = new wcf.CustomBinding(
[
	new wcf.MtomEncodingElement(),
	new wcf.HttpTransportElement()
]);

*/		

ws.send(	
	binding,
	ctx, 
	function(ctx) {  				
		console.log(ctx);
		var attach = ws.getAttachment(ctx, "response", "//*[local-name(.)='File2']");
		fs.writeFileSync("c:/temp/res.jpg", attach);				
});	
			