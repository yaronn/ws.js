var ws = require('../../lib/ws.js');
var select = require('../../lib/xpath').SelectNodes;
var Dom = require('xmldom').DOMParser;

module.exports = {

	"ws adds soap header when does not exist using namespace prefix": function (test) {

			test.expect(2);

			var mock = function() {
				this.send = function(ctx, callback) {
					
					var doc = new Dom().parseFromString(ctx.request);   

   					var header = select(doc, "/*[local-name(.)='Envelope']/*[local-name(.)='Header']");
   					test.equal(1, header.length, "soap header not found");
   					test.equal("s", header[0].prefix, "soap header has bad prefix");

   					test.done();
				}	
			}

			ctx = {request: '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body /></s:Envelope>'};
		    ws.send([new mock()], ctx, function() {})
	},

	"ws adds soap header when does not exist using default namespace": function (test) {

			test.expect(2);

			var mock = function() {
				this.send = function(ctx, callback) {
					
					var doc = new Dom().parseFromString(ctx.request);   
						
   					var header = select(doc, "/*[local-name(.)='Envelope']/*[local-name(.)='Header']");
   					test.equal(1, header.length, "soap header not found");
   					test.equal(null, header.prefix, "soap header has bad prefix");
   					
   					test.done();
				}	
			}

			ctx = {request: '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Body /></Envelope>'};
		    ws.send([new mock()], ctx, function() {})
	}
}