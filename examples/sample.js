var ws = require('./lib/ws.js')

  , ctx = 	{request: 	"<Envelope xmlns='http://schemas.xmlsoap.org/soap/envelope/'>" +
							"<Header />" +
								"<Body>" +
									"<EchoString xmlns='http://tempuri.org/'>" +
										"<s>123</s>" +
									"</EchoString>" +
								"</Body>" +
						"</Envelope>"
			,	url: "http://vmftqa32.devlab.ad/WebServices/Yaron/MyWebServices/Services/SimpleService.asmx"
			,	action: "http://tempuri.org/EchoString"
				contentType: "text/xml" 
			}

var handlers = 	[ new ws.Addr("http://ws-addressing/v8")
				, new ws.Http()
				]

ws.send(handlers, ctx, function(ctx) {  				    			
	console.log("response: " + ctx.response);
})