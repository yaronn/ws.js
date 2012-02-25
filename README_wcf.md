## WCF.JS
A WCF-compatible web service client implementation for node.js. Written in pure javascript!

Currently supports a subset of:

* BasicHttpBinding
* WSHttpBinding
* CustomBinding

The current subset includes:

* MTOM / Text encodings
* WS-Addressing (all versions)
* Transport Security (SSL)
* Transport with message credential (Username)

For more information visit [my blog](http://webservices20.blogspot.com/).

## Install
Install with [npm](http://github.com/isaacs/npm):

    npm install wcf.js

## Use

### BasicHttpBinding (TransportWithMessageCredential)
    var BasicHttpBinding = require('../lib/proxies/wcf.js').BasicHttpBinding
      , Proxy = require('../lib/proxies/wcf.js').Proxy
      , binding = new BasicHttpBinding(
            { SecurityMode:"TransportWithMessageCredential"
            , MessageClientCredentialType: "UserName"
            });
      , proxy = new Proxy(binding, "http://localhost:7171/Service/clearUsername")
      , message =  "<Envelope xmlns='http://schemas.xmlsoap.org/soap/envelope/'>" +
                     "<Header />" +
                       "<Body>" +
                         "<GetData xmlns='http://tempuri.org/'>" +
                           "<value>123</value>" +
                         "</GetData>" +
                        "</Body>" +
                   "</Envelope>";

    proxy.ClientCredentials.Username.Username = "yaron";
    proxy.ClientCredentials.Username.Password = "1234";
    proxy.send(message, "http://tempuri.org/IService/GetData", function(message, ctx) {});

### CustomBinding (Mtom + UserNameOverTransport + WSAddressing10)
    var CustomBinding = require('../lib/proxies/wcf.js').CustomBinding
      , MtomMessageEncodingBindingElement = require('../lib/proxies/wcf.js').MtomMessageEncodingBindingElement
      , HttpTransportBindingElement = require('../lib/proxies/wcf.js').HttpTransportBindingElement
      , Proxy = require('../lib/proxies/wcf.js').Proxy
      , fs = require('fs')
      , binding = new CustomBinding(
            [ new SecurityBindingElement({AuthenticationMode="UserNameOverTransport"})
            , new MtomMessageEncodingBindingElement({MessageVersion: "Soap12WSAddressing10"}),
            , new HttpTransportBindingElement()
            ])
      , proxy = new Proxy(binding, "http://localhost:7171/Service/mtom")
      , message = '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">' +
                    '<s:Header />' +
                      '<s:Body>' +
                        '<EchoFiles xmlns="http://tempuri.org/">' +
                          '<value xmlns:a="http://schemas.datacontract.org/2004/07/" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">' +
                            '<a:File1 />' +
                            '<a:File2 />' +
                          '</value>' +
                        '</EchoFiles>' +
                      '</s:Body>' +
                  '</s:Envelope>'  

    proxy.addAttachment("//*[local-name(.)='File1']", "./test/unit/client/files/p.jpg");
    proxy.addAttachment("//*[local-name(.)='File2']", "./test/unit/client/files/text.txt");
    proxy.send(message, "http://tempuri.org/IService/EchoFiles", function(message, ctx) {});