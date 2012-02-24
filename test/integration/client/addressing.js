var ws = require('../../../lib/ws.js')
  , utils = require('../../utils/utils.js')

module.exports = {
	
  setUp: function (callback) {        
    utils.setUp.call(this, callback)
  },

  tearDown: function (callback) {    
    utils.tearDown.call(this, callback)
  },

  "soap11 wsa0408": function (test) {   	
    var handlers = 	[
      new ws.Addr("http://schemas.xmlsoap.org/ws/2004/08/addressing"),
      new ws.Http()					
    ];
    utils.soapTest.call(this, test, "soap11wsa0408", "soap11", handlers )		
	},

  "soap12 wsa10": function (test) {   	
    var handlers = 	[
      new ws.Addr("http://www.w3.org/2005/08/addressing"),
      new ws.Http()					
    ];
    utils.soapTest.call(this, test, "soap12wsa10", "soap12", handlers );
  },
}