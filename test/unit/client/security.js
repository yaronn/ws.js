var fs = require('fs')
  , SecurityHandler = require('../../../lib/handlers/client/security/security.js').SecurityClientHandler
  , Dom = require('xmldom').DOMParser
  , ws = require('../../../lib/ws.js')
  , sec = require('../../../lib/handlers/client/security/security.js')
  , assert = require('assert')
  , utils = require('../../../lib/utils.js')
  , dateFormat = require('dateformat')
  , xml_assert = require('../../utils/xml-assert.js')

module.exports = {

  "generates timestamp correctly": function (test) {
    test.expect(2)
    var Mock = function(test) {
      this.send = function(ctx) {                                             
        var doc = new Dom().parseFromString(ctx.request)
          xml_assert.xpathCallback(test, doc, "//o:Security/u:Timestamp/u:Created",                   
            function(node) {
              var d = Date.parse(node.firstChild.data)
                , min = utils.dateDiffInMin(new Date(), d)
              if (min>2) {
                test.fail("created time not valid. diff from now is: " + min)                        
              }
            })
          xml_assert.xpathCallback(test, doc, "//o:Security/u:Timestamp/u:Expires",                     
            function(node) {
              var d = Date.parse(node.firstChild.data)
                , min = utils.dateDiffInMin(new Date(), d)
                if (min<4 || min>10) {
                  test.fail("expiary time not valid. diff from now is: " + min)                     
                }
              })
          test.done()
      }
    }
				
    var s = new SecurityHandler()
    s.next = new Mock(test)
    var ctx = {request: utils.EMPTY_SOAP, url: "http://someUrl"}
    ctx.action = "MyAction"
    s.send(ctx)
	},

  "username token generated correctly": function (test) {		
    test.expect(4)
    var Mock = function(test, version) {
      this.send = function(ctx) {                                             
        var doc = new Dom().parseFromString(ctx.request)
        xml_assert.xpathCallback(test, doc, "//o:Security/o:UsernameToken/o:Username",                     
          function(node) {                    	
            test.equal("yaron", node.firstChild.data, "wrong username")                      
          }
        )
        xml_assert.xpathCallback(test, doc, "//o:Security/o:UsernameToken/o:Password",                     
          function(node) {                    	
            test.equal("1234", node.firstChild.data, "wrong password")                      
          }
        )                
        test.done()
      }
    }

    var s = new SecurityHandler({}, [new sec.UsernameToken({ username: "yaron"
                                                           , password: "1234"
                                                           })])
    s.next = new Mock(test)
    var ctx = {request: utils.EMPTY_SOAP, url: "http://someUrl"}
    ctx.action = "MyAction"
    s.send(ctx)
  },

  "correctly calls next handler": function(test) {
    var Mock = function(test) {
      this.send = function(ctx) {                                             
        test.done()       
      }
    }
        
    var s = new SecurityHandler()
    s.next = new Mock(test)
    var ctx = {request: utils.EMPTY_SOAP}
    ctx.action = "MyAction"
    s.send(ctx)       
  },

  "correctly sends callback to next handler": function(test) {  	   
    var Mock = function(test, version) {
      this.send = function(ctx, callback) { callback(ctx) }
    }
    var s = new SecurityHandler()
    s.next = new Mock(test)        
    var stub = function(ctx) {}
    s.receive = function(ctx, callback) {
      test.equal(callback, stub,
        "when response came back, it did not contain the callback of previous channel")
      test.done()
    }        
    var ctx = {request: utils.EMPTY_SOAP}
    ctx.action = "MyAction"
    s.send(ctx, stub)
  },

  "correctly calls callback of previous handler": function(test) {
    var s = new SecurityHandler()                
    var ctx = {request: utils.EMPTY_SOAP}
    s.receive(ctx, function(ctx) {test.done()}, this)
  },
  
}
