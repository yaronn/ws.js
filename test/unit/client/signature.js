var fs = require('fs')
  , SecurityHandler = require('../../../lib/handlers/client/security/security.js').SecurityClientHandler
  , Dom = require('xmldom').DOMParser
  , ws = require('../../../lib/ws.js')
  , sec = require('../../../lib/handlers/client/security/security.js')
  , assert = require('assert')
  , utils = require('../../../lib/utils.js')
  , dateFormat = require('dateformat')
  , xml_assert = require('../../utils/xml-assert.js')
  , X509BinarySecurityToken = ws.X509BinarySecurityToken
  , select = require('../../../lib/xpath').SelectNodes
  , consts = require('../../../lib/consts')
  , FileKeyInfo = require('xml-crypto').FileKeyInfo  

module.exports = {

"signature is added in the right place": function(test) {        

    var callback = function(ctx, reqDoc) {
      var nodes = select(reqDoc, "//o:Security/*[local-name(.)='Signature']")
      if (nodes.length==0) test.fail("signature was not created")
      test.done()      
    }

    var res = createSignature(test, callback)
    res.security.send(res.ctx)
  },


  "signature contains keyInfo by default": function(test) {        

    var callback = function(ctx, reqDoc) {
      var ref = select(reqDoc, "//o:Security/*[local-name(.)='Signature']/*[local-name(.)='KeyInfo']" +
                               "/*[local-name(.)='SecurityTokenReference']/*[local-name(.)='Reference']")
      if (ref.length==0) test.fail("SecurityTokenReference not found under KeyInfo")                            
      var uri = utils.findAttr(ref[0], "URI")
      xml_assert.attrEquals(test, reqDoc, null, "BinarySecurityToken", "Id", uri.value.substring(1))
      test.done()
    }    

    var res = createSignature(test, callback)
    res.security.send(res.ctx)
  },

  "user can override keyInfo": function(test) {        

    function MyKeyInfo() {        
      this.getKeyInfo = function(key) {            
        return "<myKeyInfo />"        
      }
    }
    
    var callback = function(ctx, reqDoc) {
      var myKeyInfo = select(reqDoc, "//o:Security/*[local-name(.)='Signature']/*[local-name(.)='KeyInfo']" +
                               "/*[local-name(.)='myKeyInfo']")
      if (myKeyInfo.length==0) test.fail("myKeyInfo not found under KeyInfo")                                  
      test.done()
    }    

    var res = createSignature(test, callback)
    res.signature.keyInfoProvider = new MyKeyInfo()
    res.security.send(res.ctx)
  },


  "signature signs timestamp": function(test) {        

    var callback = function(ctx, reqDoc) {            
      var timestamp = select(reqDoc, "//o:Security/u:Timestamp")      
      if (timestamp.length==0) test.fail("timestamp was not found")
      var attr = utils.findAttr(timestamp[0], "Id")    
      if (!attr) test.fail("attibute Id not found on timestamp")        
      var reference = select(reqDoc, "//*[local-name(.)='Reference' and @URI='#" + attr.value + "']")
      if (reference.length==0) test.fail("could not match the <Timestamp> Id " + attr.value + " to any reference")
      test.done()
    }      

    var res = createSignature(test, callback)
    res.signature.addReference("//*[local-name(.)='Timestamp']")        
    res.security.send(res.ctx)
  },


  "validate correct signature without exception": function(test) {
        
    var res = createMockSignature(test, './test/unit/client/files/valid wss resp.xml')
    res.security.options.validateResponseSignature = true    
    assert.doesNotThrow(function() {
      res.security.send(res.ctx, function() {
        test.done()
      })
    })
    
  },

  "by default do not validate incoming signature, hence do not throw exception on invalid signature": function(test) {
        
    var res = createMockSignature(test, './test/unit/client/files/invalid wss resp - changed content.xml')    
    assert.doesNotThrow(function() {
      res.security.send(res.ctx, function() {
        test.done()
      })
    })    
  },


  "throw exception on invalid signature when validateResponseSignature is on": function(test) {    
    var res = createMockSignature(test, './test/unit/client/files/invalid wss resp - changed content.xml')            
    res.security.options.validateResponseSignature = true
    assert.throws(function() {
      res.security.send(res.ctx, function() {})
    })    
    test.done()    
  },

}

function createSignature(test, callback) {
	
  var Mock = function() {
    
    this.send = function(ctx, response_callback) {
      var doc = new Dom().parseFromString(ctx.request)
      callback(ctx, doc, response_callback)
    }
    
  }

  var x509 = new X509BinarySecurityToken(
    { "key": fs.readFileSync("./examples/client.pem").toString()})
  var signature = new ws.Signature(x509)
  signature.addReference("//*[local-name(.)='Body']")    

  var s = new ws.Security({}, 
    [ x509,
    signature
    ])
  s.next = new Mock()

  var ctx = {request: utils.EMPTY_SOAP, url: "http://someUrl"}

  return {"security": s, "signature": signature, "ctx": ctx}
}

function createMockSignature(test, file) {
  var callback = function(ctx, reqDoc, response_callback) {
        ctx.response = fs.readFileSync(file)
        response_callback(ctx)
    }
    
    var res = createSignature(test, callback)    
    res.security.options.responseKeyInfoProvider = new FileKeyInfo("./examples/server_public.pem")
    return res
}
