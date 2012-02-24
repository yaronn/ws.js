var BasicHttpBinding = require('../lib/proxies/wcf.js').BasicHttpBinding;
var Proxy = require('../lib/proxies/wcf.js').Proxy;

var binding = new BasicHttpBinding({SecurityMode:"TransportWithMessageCredential", MessageClientCredentialType: "UserName"});

var proxy = new Proxy(binding, "http://localhost:7171/Service/clearUsername");

proxy.ClientCredentials.Username.Username = "yaron";
proxy.ClientCredentials.Username.Password = "1234";


var message = 
"<Envelope xmlns='http://schemas.xmlsoap.org/soap/envelope/'>" +
"<Header />" +
"<Body>" +
"<GetData xmlns='http://tempuri.org/'>" +
"<value>123</value>" +
"</GetData>" +
"</Body>" +
"</Envelope>";

proxy.send(	
	message,
	"http://tempuri.org/IService/GetData",
	function(message, ctx) {


	});