var ws = require('../../../lib/ws.js')
  , utils = require('../../utils/utils.js')
  , assert = require('assert')
  , fs = require('fs')
  , xml_assert = require('../../utils/xml-assert.js')
  , sec = require('../../../lib/handlers/client/security/security.js')
  , X509BinarySecurityToken = ws.X509BinarySecurityToken
  , FileKeyInfo = require('xml-crypto').FileKeyInfo  

module.exports = {
	
  setUp: function (callback) {
    utils.setUp.call(this, callback)
  },

  tearDown: function (callback) {    
    utils.tearDown.call(this, callback)
  },


  "sign body only": function(test) {
    var x509 = new X509BinarySecurityToken(
                      { "key": fs.readFileSync("./examples/client.pem").toString()})
    var signature = new ws.Signature(x509)    
    signature.addReference("//*[local-name(.)='Body']")    

    var sec = new ws.Security({
      "excludeTimestamp": true, 
      "validateResponseSignature": true}, 
        [ x509
        , signature
        ])
    sec.options.responseKeyInfoProvider = new FileKeyInfo("./examples/server_public.pem")
    var handlers =  [ sec                       
                      , new ws.Http()
                    ]

    utils.soapTest.call(this, test, "sign_body_only", "soap11", handlers )
  },


  "sign body, timestamp, wsa": function(test) {
    var x509 = new X509BinarySecurityToken(
                      { "key": fs.readFileSync("./examples/client.pem").toString()})
    var signature = new ws.Signature(x509)
    signature.addReference("//*[local-name(.)='Body']")    
    signature.addReference("//*[local-name(.)='Timestamp']")    
    signature.addReference("//*[local-name(.)!='Address' and namespace-uri(.)='http://www.w3.org/2005/08/addressing']")    

    var sec = new ws.Security({"validateResponseSignature": true}, 
                      [ x509,
                        signature
                      ])
                      
    sec.options.responseKeyInfoProvider = new FileKeyInfo("./examples/server_public.pem")

    var handlers =  [ new ws.Addr("http://www.w3.org/2005/08/addressing"),
                      sec,
                      new ws.Http()
                    ]

    utils.soapTest.call(this, test, "sign_body_timestamp_wsa", "soap11", handlers )
  }

}