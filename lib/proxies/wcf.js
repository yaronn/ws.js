var ws = require('../ws.js');

exports.BasicHttpBinding = BasicHttpBinding;
exports.WsHttpBinding = WsHttpBinding;
exports.CustomBinding = CustomBinding;

exports.MtomEncodingElement = MtomEncodingElement;
exports.TextEncodingElement = TextEncodingElement;
exports.HttpTransportElement = HttpTransportElement;

function BasicHttpBinding(options) {
	
	this.getArray = function()
	{
		handlers = [];
		if (options.MessageEncoding && options.MessageEncoding.toLowerCase()=="mtom")
			handlers.push(new ws.Mtom());
		handlers.push(new ws.Http());		
		return handlers;
	}
}


function WsHttpBinding(options) {

	this.getArray = function()
			{
				handlers = [];
				if (options.MessageEncoding && options.MessageEncoding.toLowerCase()=="mtom")
					handlers.push(new ws.Mtom());
				handlers.push(new ws.Addr("http://www.w3.org/2005/08/addressing"));
				handlers.push(new ws.Http());		
				return handlers;
			}	
}


function CustomBinding(channels, options) {
	
	this.getArray = function()
			{
				handlers = [];

				for (var i in channels)
					channels[i].process(handlers);		
				
				return handlers;
			}	
}

function AddAddressing(WcfWsa, handlers)
{	
	if (!WcfWsa)
		return;

	if (WcfWsa.indexOf("WSAddressingAugust2004")!=-1)	
		handlers.push(new ws.Addr("http://schemas.xmlsoap.org/ws/2004/08/addressing"));
	if (WcfWsa.indexOf("WSAddressing10")!=-1)	
		handlers.push(new ws.Addr("http://www.w3.org/2003/05/soap-envelope"));
}

function MtomEncodingElement(options)
{
	options = options || [];
	this.process = function(handlers)
			{
				handlers.push(new ws.Mtom());
				AddAddressing(options.SoapMessageVersion, handlers)				
			}

}

function TextEncodingElement(options)
{
	
	this.process = function(handlers)
			{		
				AddAddressing(options.SoapMessageVersion, handlers)
			}

}

function HttpTransportElement(options)
{
	
	this.process = function(handlers)
			{
				handlers.push(new ws.Http());
			}

}


function HttpsTransportElement(options)
{
	
	this.process = function(handlers)
		{
			handlers.push(new ws.Http());
		}

}