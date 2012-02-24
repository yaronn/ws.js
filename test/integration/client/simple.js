var ws = require('../../../lib/ws.js')
  , utils = require('../../utils/utils.js')

module.exports = {
	
  setUp: function (callback) {      
    utils.setUp.call(this, callback)
  },

  tearDown: function (callback) {    
    utils.tearDown.call(this, callback)
  },

  "simple service": function (test) {   
    utils.soapTest.call(this, test, "simple-soap", "soap11", [new ws.Http()] )
  },

  "simple service with handler": function (test) {   
    var Mock = function(next) {	
      this.next = next
      this.send = function(ctx, callback) {                                             
        var self = this	
        ctx.request = ctx.request.replace(/123/, "456")
        this.next.send(ctx, function(ctx) { 
          self.receive(ctx, callback);
        });
  		}

      this.receive = function(ctx, callback) {
        ctx.response = ctx.response.toString().replace(/456/, "789")
        callback(ctx);
      }
    }
				
    var request = "<Envelope xmlns='http://schemas.xmlsoap.org/soap/envelope/'>" +
                    "<Header />" +
                      "<Body>" +
                        "<GetData xmlns='http://tempuri.org/'>" +
                          "<value>123</value>" +
                        "</GetData>" +
                      "</Body>" +
                  "</Envelope>"
    var ctx = 	{request:request
                , url:"http://localhost:7171/Service/simple-soap"
                , action:  "http://tempuri.org/IService/GetData"
                , contentType: "text/xml"
                }		
		var handlers = 	[new ws.Addr("http://ws-addressing/v8")
                    , new Mock()
                    , new ws.Http()
                    ]
    ws.send(handlers, ctx, function(ctx) {  				    			
      if (ctx.response.indexOf("789")==-1) {
        test.fail("after replacements response should cotnaint '789'. response is: "
           + ctx.response)
      }
      test.done()
    });	
  }
}