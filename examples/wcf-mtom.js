var CustomBinding = require('../lib/proxies/wcf.js').CustomBinding;
var MtomMessageEncodingBindingElement = require('../lib/proxies/wcf.js').MtomMessageEncodingBindingElement;
var HttpTransportBindingElement = require('../lib/proxies/wcf.js').HttpTransportBindingElement;
var Proxy = require('../lib/proxies/wcf.js').Proxy;
var fs = require('fs')

var message = 
'<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">' +
'<s:Header />' +
'<s:Body>' +
'<EchoFiles xmlns="http://tempuri.org/">' +
'<value xmlns:a="http://schemas.datacontract.org/2004/07/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">' +
'<a:File1 />' +
'<a:File2 />' +
'</value>' +
'</EchoFiles>' +
'</s:Body>' +
'</s:Envelope>';

var binding = new CustomBinding(
	[					
	new MtomMessageEncodingBindingElement({MessageVersion: "Soap12WSAddressing10"}),
	new HttpTransportBindingElement()
	]);

var proxy = new Proxy(binding, "http://localhost:7171/Service/mtom");

proxy.addAttachment("//*[local-name(.)='File1']", "./test/unit/client/files/p.jpg");
proxy.addAttachment("//*[local-name(.)='File2']", "./test/unit/client/files/text.txt");


proxy.send(	
	message,
	"http://tempuri.org/IService/EchoFiles",
	function(message, ctx) {
});
