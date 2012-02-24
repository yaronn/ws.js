var HttpHandler = require('../../../lib/handlers/client/http.js').HttpClientHandler
  , utils = require('../../../lib/utils.js')
  , http = require('http')

function testReturnsCode(test, code) {
  test.expect(1)
  var server = http.createServer(function (req, res) {
  res.writeHead(code, {'Content-Type': 'text/plain'})
    res.end(utils.EMPTY_SOAP)	
    server.close()		
  })
  server.listen(1337, "127.0.0.1")
  var h = new HttpHandler()
  var ctx = {request: utils.EMPTY_SOAP, url: "http://127.0.0.1:1337/"}
  h.send(ctx, 
    function(ctx) {			    										
      test.equal(ctx.statusCode, code, "status code not reproted correctly")
      test.done()
    }) 	
}

module.exports = {

  "correctly reports response": function (test) {        				
    test.expect(2)
    var RESPONSE = "I'm a http response!"
    var server = http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/plain'})
      res.end(RESPONSE)
      server.close()
    })
    server.listen(1337, "127.0.0.1")
    var h = new HttpHandler()
    var ctx = {request: utils.EMPTY_SOAP, url: "http://127.0.0.1:1337/"}
    h.send(ctx, function(ctx) {  				    			
      test.equal(RESPONSE, ctx.response, "handler reported wrong response")
      test.equal('text/plain', ctx.resp_contentType, "handler reported wrong contentType")
      test.done()
    })    
	},

  "correctly sends request": function (test) {
    test.expect(1)
    var REQUEST = "I'm a http request!"		
    var server = http.createServer(function (req, res) {
      var body = ''
      req.on('data', function (data) {
        body += data
      })
      req.on('end', function () {
        test.equal(REQUEST, body, "handler sent wrong request")   
        server.close()
        test.done()
      })
      res.writeHead(200, {'Content-Type': 'text/plain'})
      res.end(utils.EMPTY_SOAP)	
    })
    server.listen(1337, "127.0.0.1")
    var h = new HttpHandler()
    var ctx = {request: REQUEST, url: "http://127.0.0.1:1337/"}
    h.send(ctx, function(ctx) {})
  },

  "correctly sends default headers": function (test) {        
    test.expect(2)
    var action = "MyAction"
      , contentType = "text/xml"
      , server = http.createServer(function (req, res) {
    test.equal(action, req.headers['soapaction'], "wrong soap action sent")
    test.equal(contentType, req.headers['content-type'], "wrong content-type sent")
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(utils.EMPTY_SOAP) 	
    server.close()
    test.done() //throws exception for some reason
  })
  server.listen(1337, "127.0.0.1")
  var h = new HttpHandler()
    , ctx = { request: utils.EMPTY_SOAP
            , url: "http://127.0.0.1:1337/"
            , action: action
            , contentType: contentType
            }
		h.send(ctx, function(ctx) {})
	},

  "correctly reports code 500": function(test) {
    testReturnsCode(test, 500)
  },

  "correctly reports code 200": function(test) {
    testReturnsCode(test, 200)			
  },

  "correctly reports no server response": function(test) {
    var h = new HttpHandler()
    //note: server for the url does not exists in purpose
    var ctx = {request: utils.EMPTY_SOAP, url: "http://127.0.0.1:1337/"}
    h.send(ctx, function(ctx) {							
      test.equal("ECONNREFUSED", ctx.error.code, 
                 "error not reported correctly. reported: " + ctx.error)
      test.done()
    })
	}
}
