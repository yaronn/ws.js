var ws = require('../lib/ws.js')
, Http = ws.Http
, fs = require('fs')


function testSimple() {

  var handlers =  [ 
  new Http()
  ]

  ws.send(handlers, ctx, function(ctx) {                    
    console.log("*** simple")
    console.log(ctx.response);
  })
}


function testAddressing() {

  var handlers =  [
  new ws.Addr("http://schemas.xmlsoap.org/ws/2004/08/addressing"),
  new ws.Http()         
  ];
  ctx.url = "http://localhost:7171/Service/soap11wsa0408"

  ws.send(handlers, ctx, function(ctx) {                    
    console.log("\r\n\r\n")            
    console.log("*** addressing")
    console.log(ctx.response);      
  })

}

function testSecurity() {

  var handlers =  [     
  new ws.Security({}, [new ws.UsernameToken({username: "yaron", password: "1234"})]),      
  new ws.Http()         
  ];
  ctx.url = "http://localhost:7171/Service/clearUsername"

  ws.send(handlers, ctx, function(ctx) {                    
    console.log("\r\n\r\n")            
    console.log("*** security")
    console.log(ctx.response);      
  })
}


function testMtom() {


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
  "c:/temp/p.jpg", "image/jpeg")
  ws.addAttachment(ctx, "request", "//*[local-name(.)='File2']", 
  "c:/temp/p.jpg", "text/xml")
  var handlers =  [ new ws.Mtom()
  , new ws.Http()
  ];
  ws.send(handlers, ctx, function(ctx) {
    console.log("\r\n\r\n")            
    console.log("*** mtom")
    //console.log(ctx.response); 

    var attach = ws.getAttachment(ctx, "response", "//*[local-name(.)='File1']")
    fs.writeFileSync("c:/temp/res.jpg", attach);
  })
}


var request = "<Envelope xmlns='http://schemas.xmlsoap.org/soap/envelope/'>" +
"<Header />" +
"<Body>" +
"<GetData xmlns='http://tempuri.org/'>" +
"<value>123</value>" +
"</GetData>" +
"</Body>" +
"</Envelope>"

var ctx =  { request: request 
 , url: "http://localhost:7171/Service/simple-soap"
 , action: "http://tempuri.org/IService/GetData"
 , contentType: "text/xml" 
}

testSimple();
testAddressing();
testSecurity();
testMtom();