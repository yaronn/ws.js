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

  "authenticate with username": function (test) {   
    var handlers = 	[			
      new ws.Security({}, [new sec.UsernameToken({username: "yaron", password: "1234"})]),
      new ws.Addr("http://schemas.xmlsoap.org/ws/2004/08/addressing"),
      new ws.Http()					
    ];
    utils.soapTest.call(this, test, "clearUsername", "soap11", handlers )
  },

}