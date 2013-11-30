## WS.JS
A WS-* client stack for node.js. Written in pure javascript!

**Currently supports:**

* MTOM
* WS-Security (username tokens, x.509 digital signature)
* WS-Addressing (all versions)
* HTTP(S)

For more information visit [my blog](http://webservices20.blogspot.com/) or [my twitter](https://twitter.com/YaronNaveh).

## Install
Install with [npm](http://github.com/isaacs/npm):

    npm install ws.js

## Usage

### WS-Security (Username)
`````javascript
    var ws = require('ws.js')
      , Http = ws.Http
      , Security = ws.Security
      , UsernameToken = ws.UsernameToken

    var request =  '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">' +
                      '<Header />' +
                        '<Body>' +
                          '<EchoString xmlns="http://tempuri.org/">' +
                            '<s>123</s>' +
                          '</EchoString>' +
                        '</Body>' +
                    '</Envelope>'

    var ctx =  { request: request 
               , url: "http://service/security"
               , action: "http://tempuri.org/EchoString"
               , contentType: "text/xml" 
               }


    var handlers =  [ new Security({}, [new UsernameToken({username: "yaron", password: "1234"})])
                    , new Http()
                    ]

    ws.send(handlers, ctx, function(ctx) {                    
      console.log("response: " + ctx.response);
    })
`````
==>
`````xml
    <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" xmlns:o="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
    <Header>
      <o:Security>
        <u:Timestamp>
          <u:Created>2012-02-26T11:03:40Z</u:Created>
          <u:Expires>2012-02-26T11:08:40Z</u:Expires>
        </u:Timestamp>
        <o:UsernameToken>
          <o:Username>yaron</o:Username>
          <o:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">1234</o:Password>
        </o:UsernameToken>
      </o:Security>
    </Header>
    <Body>
      <EchoString xmlns="http://tempuri.org/">
        <s>123</s>
      </EchoString>
    </Body>
  </Envelope>
`````

### WS-Security (digital signature)
`````javascript
var ws = require('ws.js')
, fs = require('fs')
, sec = ws.Security
, X509BinarySecurityToken = ws.X509BinarySecurityToken
, FileKeyInfo = require('xml-crypto').FileKeyInfo  

var x509 = new X509BinarySecurityToken(
  { "key": fs.readFileSync("client.pem").toString()})
var signature = new ws.Signature(x509)
signature.addReference("//*[local-name(.)='Body']")    
signature.addReference("//*[local-name(.)='Timestamp']")    

var sec = new ws.Security({}, [ x509, signature ])

var handlers =  [ new ws.Addr("http://www.w3.org/2005/08/addressing")
                , sec
                , new ws.Http()
                ]

request = "<Envelope xmlns='http://schemas.xmlsoap.org/soap/envelope/'>" +
          "<Header />" +
            "<Body>" +
              "<GetData xmlns='http://tempuri.org/'>" +
                "<value>123</value>" +
              "</GetData>" +
            "</Body>" +
          "</Envelope>"

var ctx =   { request: request
  , url: "http://localhost:7171/Service/signature"
  , action: "http://tempuri.org/IService/GetData"
  , contentType: "text/xml"
}

ws.send(handlers, ctx, function(ctx) {                    
  console.log("status " + ctx.statusCode)
  console.log("messagse " + ctx.response)
})  
`````

==>
`````xml
<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://www.w3.org/2005/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" xmlns:o="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
  <Header>
    <ws:Action>http://tempuri.org/IService/GetData</ws:Action>
    <ws:To>http://localhost:8888/</ws:To>
    <ws:MessageID>ca62b7d7-4f74-75ed-9f5c-b09b173f6747</ws:MessageID>
    <ws:ReplyTo>
      <ws:Address>http://www.w3.org/2005/08/addressing/role/anonymous</ws:Address>
    </ws:ReplyTo>
    <o:Security>
      <u:Timestamp xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="_1">
        <u:Created>2012-05-25T12:18:38Z</u:Created>
        <u:Expires>2012-05-25T12:23:38Z</u:Expires>
      </u:Timestamp>
      <o:BinarySecurityToken ValueType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3" EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary" u:Id="sec_0">MIIBxDCCAW6gAwIBAgIQxUSXFzWJYYtOZnmmuOMKkjANBgkqhkiG9w0BAQQFADAWMRQwEgYDVQQDEwtSb290IEFnZW5jeTAeFw0wMzA3MDgxODQ3NTlaFw0zOTEyMzEyMzU5NTlaMB8xHTAbBgNVBAMTFFdTRTJRdWlja1N0YXJ0Q2xpZW50MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+L6aB9x928noY4+0QBsXnxkQE4quJl7c3PUPdVu7k9A02hRG481XIfWhrDY5i7OEB7KGW7qFJotLLeMec/UkKUwCgv3VvJrs2nE9xO3SSWIdNzADukYh+Cxt+FUU6tUkDeqg7dqwivOXhuOTRyOI3HqbWTbumaLdc8jufz2LhaQIDAQABo0swSTBHBgNVHQEEQDA+gBAS5AktBh0dTwCNYSHcFmRjoRgwFjEUMBIGA1UEAxMLUm9vdCBBZ2VuY3mCEAY3bACqAGSKEc+41KpcNfQwDQYJKoZIhvcNAQEEBQADQQAfIbnMPVYkNNfX1tG1F+qfLhHwJdfDUZuPyRPucWF5qkh6sSdWVBY5sT/txBnVJGziyO8DPYdu2fPMER8ajJfl</o:BinarySecurityToken>
      <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
        <SignedInfo>
          <CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#" />
          <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1" />
          <Reference URI="#_0">
            <Transforms>
              <Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#" />
            </Transforms>
            <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1" />
            <DigestValue>fxQc0PEh2GHA43IXltm6gjbccsA=</DigestValue>
          </Reference>
          <Reference URI="#_1">
            <Transforms>
              <Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#" />
            </Transforms>
            <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1" />
            <DigestValue>L+vrfEszbn2ZtXiWfNyDG8nM1e8=</DigestValue>
          </Reference>
        </SignedInfo>
        <SignatureValue>AcOb1KJHpyQnnChEZFKaIjVag8iREL7g+LEXnvHQ/wH9ffIj0s1sdF2xO2AvQkqLUeefIEPgyiKUPR9sk8RMchJxv7UDx8wGuvD2WFPbd3yy50qcsu2UkiUm0lW/R3lpv88w83Z95LFZ1yq1MnOe2Sh0y5esoCbJo1fJETS8mQ0=</SignatureValue>
        <KeyInfo>
          <o:SecurityTokenReference>
            <o:Reference URI="#sec_0" ValueType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3" />
          </o:SecurityTokenReference>
        </KeyInfo>
      </Signature>
    </o:Security>
  </Header>
  <Body xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="_0">
    <GetData xmlns="http://tempuri.org/">
      <value>123</value>
    </GetData>
  </Body>
</Envelope>
`````

**Notes:**

By default incoming signatures are not validates. To validate these signatures when you create the security channel specify the validateResponseSignature parameter:

`````javascript
var sec = new ws.Security({"validateResponseSignature": true} ...
`````

Next specify the server certificate (the public key corresponding to the server private sgining key):

`````javascript
sec.options.responseKeyInfoProvider = new FileKeyInfo("./examples/server_public.pem")
`````

In the future the server certificate will be extracted from the BinarySecurityToken automatically (when available).

### MTOM    
`````javascript
    var ws = require('ws.js')
      , Http = ws.Http
      , Mtom = ws.Mtom

    var request = '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">' +
                    '<s:Body>' +
                      '<EchoFiles xmlns="http://tempuri.org/">' +                        
                          '<File1 />' +
                      '</EchoFiles>' +
                    '</s:Body>' +
                  '</s:Envelope>'   
    
    var ctx = { request: request
              , contentType: "application/soap+xml"
              , url: "http://localhost:7171/Service/mtom"
              , action: "http://tempuri.org/IService/EchoFiles"
              }

    //add attachment to the soap request
    ws.addAttachment(ctx, "request", "//*[local-name(.)='File1']", 
                    "me.jpg", "image/jpeg")
    
    var handlers =  [ new Mtom()
                    , new Http()
                    ];
    
    ws.send(handlers, ctx, function(ctx) {      
      //read an attachment from the soap response
      var file = ws.getAttachment(ctx, "response", "//*[local-name(.)='File1']")
      fs.writeFileSync("result.jpg", file)      
    })
`````
==>
`````xml
    --my_unique_boundary
    Content-ID: <part0>
    Content-Transfer-Encoding: 8bit
    Content-Type: application/xop+xml;charset=utf-8;type="application/soap+xml"

    <s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
      <s:Body>
        <EchoFiles xmlns="http://tempuri.org/">
          <File1>
            <xop:Include xmlns:xop="http://www.w3.org/2004/08/xop/include" href="cid:part1" />
          </File1>
        </EchoFiles>
      </s:Body>
      <s:Header />
    </s:Envelope>
    --my_unique_boundary
    Content-ID: <part1>
    Content-Transfer-Encoding: binary
    Content-Type: image/jpeg

    [binary here...]
`````
### WS-Addressing
`````javascript
    var ws = require('ws.js')
      , Http = ws.Http
      , Addr = ws.Addr
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

    var handlers =  [ new Addr("http://schemas.xmlsoap.org/ws/2004/08/addressing")
                    , new Http()
                    ]

    ws.send(handlers, ctx, function(ctx) {                    
      console.log("response: " + ctx.response);
    })
`````
==>
`````xml
    <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://schemas.xmlsoap.org/ws/2004/08/addressing">
      <Header>
        <ws:Action>http://tempuri.org/EchoString</ws:Action>
        <ws:To>http://server/wsa/</ws:To>
        <ws:MessageID>6c4189e5-60f5-195e-b7ce-4e236d63c379</ws:MessageID>
        <ws:ReplyTo>
          <ws:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</ws:Address>
        </ws:ReplyTo>
      </Header>
      <Body>
        <EchoString xmlns="http://tempuri.org/">
          <s>123</s>
        </EchoString>
      </Body>
    </Envelope>
`````
### SSL
Just specify an http**s** address in any of the previous samples.

### All together now
`````javascript
    var ws = require('ws.js')
      , Http = ws.Http
      , Addr = ws.Addr
      , Mtom = ws.Mtom
      , Security = ws.Security
      , UsernameToken = ws.UsernameToken
      , ctx =  { request:   "<Envelope xmlns='http://schemas.xmlsoap.org/soap/envelope/'>" +
                              "<Header />" +
                                "<Body>" +
                                  "<EchoString xmlns='http://tempuri.org/'>" +
                                    "<File1 />" +
                                  "</EchoString>" +
                                "</Body>" +
                            "</Envelope>"

               , url: "https://localhost/service"
               , action: "http://tempuri.org/EchoString"
               , contentType: "text/xml" 
               }

    ws.addAttachment(ctx, "request", "//*[local-name(.)='File1']", 
                      "me.jpg", "image/jpeg")

    var handlers =  [ new Security({}, [new UsernameToken({username: "yaron", password: "1234"})])
                    , new Addr("http://ws-addressing/v8")
                    , new Mtom() //Mtom must be after everything except http
                    , new Http()
                    ]

    ws.send(handlers, ctx, function(ctx) {                    
      console.log("response: " + ctx.response);
    })
`````

### License
This software is licensed udner the **MIT license**.

Copyright (C) 2012 Yaron Naveh ([mail](mailto:yaronn01@gmail.com), [blog](http://webservices20.blogspot.com/))

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### More details
* [http://webservices20.blogspot.com/](http://webservices20.blogspot.com/)
* Or drop me an [email](mailto:yaronn01@gmail.com)


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/yaronn/ws.js/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

