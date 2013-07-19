var fs = require('fs')
  , writer = require('../../../lib/handlers/client/mtom/mime-writer.js')
  , reader = require('../../../lib/handlers/client/mtom/mime-reader.js')
  , MtomHandler = require('../../../lib/handlers/client/mtom/mtom.js').MtomClientHandler
  , select = require('../../../lib/xpath').SelectNodes
  , Dom = require('xmldom').DOMParser
  , ws = require('../../../lib/ws.js')
  , assert = require('assert')
  , utils = require('../../../lib/utils.js')

module.exports = {

  "mime writer correctly writes attachments": function (test) {        				
    var parts = 
    [
      {
        id: "id1",
        contentType: "text/xml",
        body: new Buffer('<x><y>123</y><file><xop:Include href="cid:id2" xmlns:xop="http://www.w3.org/2004/08/xop/include"/></file></x>')
      },

      {
        id: "id2",
        contentType: "application/octet-stream",
        body: fs.readFileSync("./test/unit/client/files/p.jpg")
      },

      {
        id: "id3",
        contentType: "text/plain",
        body: fs.readFileSync("./test/unit/client/files/text.txt")
      }
    ]
    
    var body = writer.build_multipart_body(parts, "my_unique_boundary")	
    assert.deepEqual(fs.readFileSync("./test/unit/client/files/expected_writer_output.bin"), 
                    body, 
                    "multipart body different than expected")

    test.done()
  },

  "mime reader correctly reads attachments and headers": function (test) {        				

    var buff = fs.readFileSync("./test/unit/client/files/expected_writer_output.bin")
      , parts = reader.parse_multipart(buff, "my_unique_boundary")
    test.equal(3, parts.length, "wrong number of parts")
    test.equal("text/xml", parts[0].headers["content-type"], "wrong content type for part 1")
    test.equal("application/octet-stream", parts[1].headers["content-type"], "wrong content type for  part 2")
    test.equal("text/plain", parts[2].headers["content-type"], "wrong content type for part 3")
    test.equal("<id1>", parts[0].headers["content-id"], "wrong content id for part 1")
    test.equal("<id2>", parts[1].headers["content-id"], "wrong content id for  part 2")
    test.equal("<id3>", parts[2].headers["content-id"], "wrong content id for part 3")
    var body = parts[0].data.toString()
      , doc = new Dom().parseFromString(body)
      , envelope_res = select(doc, "/x/file")
    test.equal(1, envelope_res.length, "part 1 does not contain the expected xml")

    assert.deepEqual(fs.readFileSync("./test/unit/client/files/p.jpg"), 
      parts[1].data, 
      "part 1 does not contain expected content (jpg)")

    assert.deepEqual(fs.readFileSync("./test/unit/client/files/text.txt"), 
      parts[2].data, 
      "part 2 does not contain expected content (txt)")

    test.done()
  },

  "add attachments works well": function(test) {
    var ctx = {request: "<x><str>abc</str><file1 /><file2 /></x>"}
    file1path = "./test/unit/client/files/p.jpg"
    file2path = "./test/unit/client/files/text.txt"
    var file1 = fs.readFileSync(file1path)
      , file2 = fs.readFileSync(file2path)
    ws.addAttachment(ctx, "request", "/x/file1", file1path, 
      "application/octet-stream")
    ws.addAttachment(ctx, "request", "/x/file2", file2path, 
      "text/plain")
    var doc = new Dom().parseFromString(ctx.request)
      , elem1 = select(doc, "//file1")[0]
    test.equals(file1.toString("base64").length, 
                elem1.firstChild.data.length, 
                "first attachment appears wrong in soap")
    var elem2 = select(doc, "//file2")[0]
    test.equals(file2.toString("base64").length, 
                elem2.firstChild.data.length, 
                "second attachment appears wrong in soap")
    test.equals(ctx.base64Elements.length, 2, 
      "wrong number of base64 elements registered")
    test.equals(ctx.base64Elements[0].xpath, "/x/file1", 
      "first registered base64 is wrong")
    test.equals(ctx.base64Elements[1].xpath, "/x/file2", 
      "second registered base64 is wrong")

    test.done()
  },

  "handler correctly sets content type, xml body, and parts": function(test) {

    var ctx = { request: "<x><str>abc</str><file1>AAAA</file1><file2>BBBB</file2></x>"
              , contentType: "old/contentType"
              , action: "myAction"
              }		
    ctx.base64Elements = [{xpath: "//file1", contentType: 'type/attach1'}, {xpath: "//file2", contentType: 'type/attach2'}]
    var Mock = function() {
      this.send = function(ctx) {          
        //validate context
        test.equal(ctx.contentType, 
          'multipart/related; type="application/xop+xml";start="<part0>";boundary="my_unique_boundary";start-info="old/contentType"; action="myAction"',
          "wrong content type")
        var doc = new Dom().parseFromString(ctx.request.toString())
        if (ctx.request.indexOf("<file1>AAAA</file1>")!=-1) {
          test.fail("file1 was not replaced")
        }

        if (ctx.request.indexOf("<file2>BBBB</file2>")!=-1) {
          test.fail("file2 was not replaced")
        }

        if (ctx.request.indexOf('<file1><xop:Include xmlns:xop="http://www.w3.org/2004/08/xop/include" href="cid:part1"/></file1>')==-1) {
          test.fail("file1 placehoder is wrong") 
        }
         
        if (ctx.request.indexOf('<file2><xop:Include xmlns:xop="http://www.w3.org/2004/08/xop/include" href="cid:part2"/></file2>')==-1) {
         test.fail("file2 placehoder is wrong")
        }

        //search for these body parts
        if (ctx.request.indexOf("<part1>")==-1) {
          test.fail("part1 not in request")
        }       
        if (ctx.request.indexOf("<part2>")==-1) {
          test.fail("part2 not in request")
        }
        test.done()
      }
    }
    var m = new MtomHandler()
    m.next = new Mock()
    m.send(ctx, function(ctx) {})
  },

  "behave correctly when there are no attachments": function(test) {
    var ctx = { request: "<x>123</x>"
             , contentType: "old/contentType"
             , action: "myAction"			   	
             }	

    var Mock = function() {
      this.send = function(ctx) {  
        test.equal(ctx.contentType, 
                 'multipart/related; type="application/xop+xml";start="<part0>";boundary="my_unique_boundary";start-info="old/contentType"; action="myAction"',
                 "wrong content type")
        if (ctx.request.indexOf("my_unique_boundary")==-1) {
          test.fail("no boundary found when there are no attachments")            	
        }

        test.done()
      }
    }

    var m = new MtomHandler()
    m.next = new Mock()
    m.send(ctx, function(ctx) {})
  },

  "correctly calls next handler": function(test) {

   var Mock = function() {
    this.send = function(ctx) {                                             
      test.done()       
    }
  }

  var m = new MtomHandler()
  m.next = new Mock()      
  m.send({request: "<x></x>"})              
  },

  "handler correctly reads attachments from response": function(test) {

    var ctx = { resp_contentType: 'multipart/related; type="application/xop+xml";start="<part0>";'
                    + 'boundary="my_unique_boundary";start-info="old/contentType"; action="myAction"'
                //add \r\n in http multipart response the first chars seems to be #13#10
             , response: Buffer.concat([new Buffer("\r\n"), fs.readFileSync("./test/unit/client/files/expected_writer_output.bin")])
             }

    var m = new MtomHandler()

    m.receive(ctx, function(ctx) {						
        var doc = new Dom().parseFromString(ctx.response)					
        var elem = select(doc, "/x/file")[0]										
        assert.deepEqual(fs.readFileSync("./test/unit/client/files/p.jpg"), 
        new Buffer(elem.firstChild.data, "base64"),
        "attachment is not the jpg file")		
        test.done()
      })
  },

  "ws.getAttachment should extract attachments": function(test) {
    var ctx = {response: '<x><f>BBBB</f></x>'}
      , buff = ws.getAttachment(ctx, "response", "/x/f")
    assert.deepEqual(buff, 
      new Buffer("BBBB", "base64"), 
      "get attachment does not return expected attachment")
    test.done()
  },

  "correctly sends callback to next handler": function(test) {
    var Mock = function(test) {
      this.send = function(ctx, callback) { callback(ctx) }
    }
    var a = new MtomHandler()    
    a.next = new Mock(test)

    var stub = function(ctx) {}

    a.receive = function(ctx, callback) {
      test.equal(callback, stub,
        "when response came back, it did not contain the callback of previous channel")
        test.done()
    }

    var ctx = {request: utils.EMPTY_SOAP}
    ctx.action = "MyAction"
    ctx.contentType = "text/xml"

    a.send(ctx, stub)
  },

  "correctly calls callback of previous handler": function(test) {
    var m = new MtomHandler()             
      , ctx = { resp_contentType: 'multipart/related; type="application/xop+xml";'
                    + 'start="<part0>";boundary="my_unique_boundary";start-info="old/contentType"; action="myAction"'
              , response: fs.readFileSync("./test/unit/client/files/expected_writer_output.bin")
              }
    m.receive(ctx, function(ctx) {test.done()}, this)
  },

  "correctly parse boundary": function(test) {
    var boundary = utils.parseBoundary('multipart/related; type="application/xop+xml";start="<part0>";boundary="my_other_boundary";start-info="old/contentType"; action="myAction"');
    test.equal("my_other_boundary", boundary)
    test.done()
  }
}