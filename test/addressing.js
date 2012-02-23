var addr = require('../lib/client_handler.js').wsAddressingClientHandler;
var context = require('../lib/handler_context.js').handlerContext;
var select = require('../../lib/xpath').SelectNodes;
var dom = require('xmldom').DOMParser;

var EMPTY_SOAP = "<Envelope xmlns='http://schemas.xmlsoap.org/soap/envelope/'><Header /><Body /></Envelope>";

var mock = function(test, version) {
    			this.handleOutput = function(ctx) {    			    			    			
					var doc = new dom().parseFromString(ctx.message);
					var result = select(doc, "//*[namespace-uri(.)='"+version+"']");
					
					if (result.length!=1) {
						test.fail("one or more addressing headers not found");
					}
					else {
						if (result[0].localName!="Action")
							test.fail("action header not found");
						if (result[0].firstChild.data!=ctx.action)
							test.fail("action header header has incorrect value. Expected: " + ctx.action + " Found: " + result[0].firstChild.data);
					}

	        		test.done();
    			}
    	}

module.exports = {
    
    "correctly sets addressing": function (test) {

    	var v = "http://ws-addressing/v8";
    	var a = addr(v, new mock(test, v));    	
    	var ctx = context(EMPTY_SOAP, "http://someUrl/");
    	ctx.action = "MyAction";
    	a.handleOutput(ctx);       
    },

    "correctly calls next handler": function(test) {
    	
            test.done();
    },


	"correctly calls callback": function(test) {
    	
            test.done();
    },

};