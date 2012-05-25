var ws = require('../../lib/ws.js')

exports.setUp = function (callback) {
  this.wcf = require('child_process').spawn('./test/integration/working-services/service-c#/service/bin/Debug/service.exe')
  this.up = false
  this.wcf.stdout.on('data', function (data) {									
    if (this.up) return
    if (data.toString().indexOf("Service Started")==-1) return  				
    this.up=true
    callback()
  })		
}

exports.tearDown = function (callback) {    
  this.wcf.kill()
  callback()
}

exports.soapTest = function(test, endpoint, version, handlers, validator) {	
  test.expect(2)
  var ns = version == "soap11" ? 
    "http://schemas.xmlsoap.org/soap/envelope/" : 
    "http://www.w3.org/2003/05/soap-envelope"
	  , request = "<Envelope xmlns='"+ns+"'>" +
                  "<Header />" +
                   "<Body>" +
                    "<GetData xmlns='http://tempuri.org/'>" +
                      "<value>123</value>" +
                    "</GetData>" +
                  "</Body>" +
              "</Envelope>"
  var ctx =   { request: request
              , url: "http://localhost:7171/Service/" + endpoint
              , action: "http://tempuri.org/IService/GetData"
              , contentType: version == "soap11" ? "text/xml" : " application/soap+xml; charset=utf-8"
	}

  ws.send(handlers,	ctx, function(ctx) {  				    			

    test.equal(200, ctx.statusCode, "status code shows an error")
    test.equal(null, ctx.error, "there was an error")				
    if (ctx.response.indexOf("You entered: 123")==-1) {
      test.fail("response does not contain 'You entered: 123'. Response is: " + ctx.response)
    }
    if (validator) validator(test, ctx)
    
    test.done()
  })	
}