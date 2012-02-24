var ws = require('../../../lib/ws.js')
  , utils = require('../../utils/utils.js')
  , assert = require('assert')
  , fs = require('fs')

module.exports = {
	
  setUp: function (callback) {        
    utils.setUp.call(this, callback)
  },

  tearDown: function (callback) {    
    utils.tearDown.call(this, callback)
  },

  "echo mtom attachments": function (test) {   	
    var request = '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">' +
		                '<s:Body>' +
		                  '<EchoFiles xmlns="http://tempuri.org/">' +
		                    '<value xmlns:a="http://schemas.datacontract.org/2004/07/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">' +
		                      '<a:File1 />' +
		                      '<a:File2 />' +
		                    '</value>' +
		                  '</EchoFiles>' +
		                '</s:Body>' +
		              '</s:Envelope>'		
    
    var ctx = { request: request
              , contentType: "application/soap+xml"
              , url: "http://localhost:7171/Service/mtom"
              , action: "http://tempuri.org/IService/EchoFiles"
              }
    ws.addAttachment(ctx, "request", "//*[local-name(.)='File1']", 
                    "./test/unit/client/files/p.jpg", "image/jpeg")
    ws.addAttachment(ctx, "request", "//*[local-name(.)='File2']", 
                    "./test/unit/client/files/text.txt", "text/xml")
    var handlers = 	[ new ws.Mtom()
                    , new ws.Http()
                    ];
    ws.send(handlers, ctx, function(ctx) {
      if (ctx.statusCode!=200) test.fail("got an error")
      var attach = ws.getAttachment(ctx, "response", "//*[local-name(.)='File1']")
      assert.deepEqual(fs.readFileSync("./test/unit/client/files/p.jpg"), 
                      attach, 
                      "attachment 1 is not the jpg file");	

        var attach = ws.getAttachment(ctx, "response", "//*[local-name(.)='File2']")
        assert.deepEqual(fs.readFileSync("./test/unit/client/files/text.txt"), 
                         attach, 
                         "attachment 2 is not the txt file")	
        test.done()
    })
  },
}