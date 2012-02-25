var Addr = require('../../../lib/handlers/client/addressing.js').WsAddressingClientHandler
  , Dom = require('xmldom').DOMParser
  , xml_assert = require('../../utils/xml-assert.js')
  , utils = require('../../../lib/utils.js')

module.exports = {    
  "correctly sets addressing": function (test) {
    var Mock = function(test, version) {
      this.send = function(ctx) {                                             
        var doc = new Dom().parseFromString(ctx.request)
        xml_assert.nodeEquals(test, doc, version, "Action", ctx.action)
        xml_assert.nodeEquals(test, doc, version, "To", ctx.url)
        xml_assert.nodeCallback(test, doc, version, "ReplyTo", 
          function(node) {
            var addr = node.firstChild
            test.ok(addr.localName=="Address" && addr.namespaceURI==version, 
              "ws:Address not found under wsa:ReplyTo")                            
            var expected = version + "/role/anonymous"
            test.equal(addr.firstChild.data, expected,
              "wsa:Address has wrong value. Expected: " + expected 
              + " Actual: " + addr.firstChild.data)
          }
        )
        xml_assert.nodeCallback(test, doc, version, "MessageID", 
          function(node) {
            test.equal(node.firstChild.data.length, 36, "wrong MessageID")
          }
        )
        test.done()
      }
    }

    var v = "http://ws-addressing/v8"
      , a = new Addr(v)
    a.next = new Mock(test, v)
    var ctx = {request: utils.EMPTY_SOAP, url: "http://someUrl"}
    ctx.action = "MyAction"
    a.send(ctx)
  },

  "correctly calls next handler": function(test) {
    var Mock = function(test, version) {
      this.send = function(ctx) {                                             
        test.done()      
      }
    }
    var v = "http://ws-addressing/v8"
    var a = new Addr(v)
    a.next = new Mock(test, v)
    var ctx = {request: utils.EMPTY_SOAP}
    ctx.action = "MyAction"
    a.send(ctx)                 
  },

  "correctly sends callback to next handler": function(test) {  	   
    var Mock = function(test, version) {
      this.send = function(ctx, callback) { callback(ctx) }
    }

    var v = "http://ws-addressing/v8"
    var a = new Addr(v)
    a.next = new Mock(test, v)

    var stub = function(ctx) {}
    a.receive = function(ctx, callback) {
      test.equal(callback, stub,
        "when response came back, it did not contain the callback of previous channel");
      test.done()
    }
            
    var ctx = {request: utils.EMPTY_SOAP}
    ctx.action = "MyAction"
    a.send(ctx, stub)
  },

  "correctly calls callback of previous handler": function(test) {
    var a = new Addr()              
    var ctx = {request: utils.EMPTY_SOAP}
    a.receive(ctx, function(ctx) {test.done()}, this) 
  },
};