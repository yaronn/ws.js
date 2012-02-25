var ws = require('../../lib/ws.js')
  , select = require('../../lib/xpath').SelectNodes
  , Dom = require('xmldom').DOMParser

module.exports = {

  "ws adds soap header as first child when does not exist using namespace prefix": function (test) {
    test.expect(2)
    var mock = function() {
      
      this.send = function(ctx, callback) {				
        var doc = new Dom().parseFromString(ctx.request)
          , childs = select(doc, "/*[local-name(.)='Envelope']/*")
        
        if (childs.length!=2)  
          test.fail("soap:envelope should have exactly 2 childs but it has only " + childs.length);
        test.equal("Header", childs[0].localName, "soap header not found")        
        test.equal("s", childs[0].prefix, "soap header has bad prefix")
        test.done()
      }	
    }
    ctx = {request: 
      '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body /></s:Envelope>'}
    ws.send([new mock()], ctx, function() {})
	},

  "ws adds soap header as first child when does not exist using default namespace": function (test) {
    test.expect(2)
    var mock = function() {
      this.send = function(ctx, callback) {
        var doc = new Dom().parseFromString(ctx.request)
          , childs = select(doc, "/*[local-name(.)='Envelope']/*")
        if (childs.length!=2)  
          test.fail("soap:envelope should have exactly 2 childs but it has only " + childs.length);
        test.equal("Header", childs[0].localName, "soap header not found")
        test.equal(null, childs[0].prefix, "soap header has bad prefix")
        test.done()
      }	
    }
    ctx = {request: '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">'
          + '<Body /></Envelope>'}
    ws.send([new mock()], ctx, function() {})
  }
}