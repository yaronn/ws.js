A WS-* client implementation for node.js. Written in pure javascript!

Currently supports:

* MTOM
* WS-Security (username tokens only)
* WS-Addressing (all versions)
* HTTP(S)

For more information visit [my blog](http://webservices20.blogspot.com/) or drop me an [an mail](mailto:yaronn01@gmail.com).

## Install

Install with [npm](http://github.com/isaacs/npm):

    npm install ws.js

## Use

### WS-Security (username)
    var ws = require('ws.js')
      , ctx =  { request:   '<Envelope xmlns="'"http://schemas.xmlsoap.org/soap/envelope/">'' +
                              '<Header /> +
                                '<Body> +
                                  '<EchoString xmlns="http://tempuri.org/">'' +
                                    '<s>123</s>'' +
                                  '</EchoString>'' +
                                '</Body>' +
                            '</Envelope>'
               , url: "http://localhost/service"
               , action: "http://tempuri.org/EchoString"
               , contentType: "text/xml" 
               }

    var handlers =  [ new ws.Security({}, [new sec.UsernameToken({username: "yaron", password: "1234"})]),
                    , new ws.Http()
                    ]

    ws.send(handlers, ctx, function(ctx) {                    
      console.log("response: " + ctx.response);
    })

==>

    <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">  
      <s:Body>  
            <x>  
                    <y>456</y>  
            </x>  
      </s:Body>  
    </s:Envelope>

### MTOM

    var request = '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">' +
                    '<s:Body>' +
                      '<EchoFiles xmlns="http://tempuri.org/">' +                        
                          '<a:File1 />' +
                      '</EchoFiles>' +
                    '</s:Body>' +
                  '</s:Envelope>'   
    
    var ctx = { request: request
              , contentType: "application/soap+xml"
              , url: "http://localhost:7171/Service/mtom"
              , action: "http://tempuri.org/IService/EchoFiles"
              }
    ws.addAttachment(ctx, "request", "//*[local-name(.)='File1']", 
                    "me.jpg", "image/jpeg")
    
    var handlers =  [ new ws.Mtom()
                    , new ws.Http()
                    ];
    ws.send(handlers, ctx, function(ctx) {      
      var file = ws.getAttachment(ctx, "response", "//*[local-name(.)='File1']")
      fs.writeFileSync("result.jpg", file)      
    })

==>

    <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">  
      <s:Body>  
            <x>  
                    <y>456</y>  
            </x>  
      </s:Body>  
    </s:Envelope>

### WS-Addressing
    var ws = require('ws.js')
      , ctx =  { request:   "<Envelope xmlns='http://schemas.xmlsoap.org/soap/envelope/'>" +
                              "<Header />" +
                                "<Body>" +
                                  "<EchoString xmlns='http://tempuri.org/'>" +
                                    "<s>123</s>" +
                                  "</EchoString>" +
                                "</Body>" +
                            "</Envelope>"
               , url: "http://localhost/service"
               , action: "http://tempuri.org/EchoString"
               , contentType: "text/xml" 
               }

    var handlers =  [ new ws.Addr("http://ws-addressing/v8")
                    , new ws.Http()
                    ]

    ws.send(handlers, ctx, function(ctx) {                    
      console.log("response: " + ctx.response);
    })

==>

    <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">  
      <s:Body>  
            <x>  
                    <y>456</y>  
            </x>  
      </s:Body>  
    </s:Envelope>

### SSL
Just specify an https address in any of the previous samples.

### All together now
  
    var ws = require('ws.js')
      , ctx =  { request:   "<Envelope xmlns='http://schemas.xmlsoap.org/soap/envelope/'>" +
                              "<Header />" +
                                "<Body>" +
                                  "<EchoString xmlns='http://tempuri.org/'>" +
                                    "<File 1 />" +
                                  "</EchoString>" +
                                "</Body>" +
                            "</Envelope>"
               , url: "http://localhost/service"
               , action: "http://tempuri.org/EchoString"
               , contentType: "text/xml" 
               }

    ws.addAttachment(ctx, "request", "//*[local-name(.)='File1']", 
                      "me.jpg", "image/jpeg")

    var handlers =  [ new ws.Security({}, [new sec.UsernameToken({username: "yaron", password: "1234"})]),
                    , new ws.Addr("http://ws-addressing/v8")
                    , new ws.Mtom() //Mtom must be after everything except http
                    , new ws.Http()
                    ]

    ws.send(handlers, ctx, function(ctx) {                    
      console.log("response: " + ctx.response);
    })

### More details
* [http://webservices20.blogspot.com/](http://webservices20.blogspot.com/)
* [yaronn01@gmail.com](mailto:yaronn01@gmail.com)
