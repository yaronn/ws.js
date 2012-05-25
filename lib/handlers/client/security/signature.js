var select = require('../../../xpath').SelectNodes
  , Dom = require('xmldom').DOMParser
  , utils = require('../../../utils')
  , crypto = require('xml-crypto')
  , SignedXml = require('xml-crypto').SignedXml

exports.Signature = Signature

function Signature(signingToken) {
	if (!signingToken)
		throw "cannot create signature if a signing token is not specified"
	this.signingToken = signingToken
	this.signature = new SignedXml("wssecurity")	
	this.keyInfoProvider = new WSSKeyInfo(this.signingToken)
	this.signatureAlgorithm = null
	this.canonicalizationAlgorithm = null
}

Signature.prototype.addReference = function(xpath, transforms, digestAlgorithm) {	
	this.signature.addReference(xpath, transforms, digestAlgorithm)
}

Signature.prototype.applyMe = function(doc, security) {		
	if (this.signatureAlgorithm) {
		this.signature.signatureAlgorithm = this.signatureAlgorithm
	}
	if (this.canonicalizationAlgorithm) {
		this.signature.canonicalizationAlgorithm = this.canonicalizationAlgorithm
	}
	if (this.keyInfoProvider) {
		this.signature.keyInfoProvider = this.keyInfoProvider
	}
	this.signature.signingKey = this.signingToken.getKey()
	this.signature.computeSignature(doc.toString())

  var sigXml = this.signature.getSignatureXml()
  var newSoap = this.signature.getOriginalXmlWithIds()

  var newDoc = new Dom().parseFromString(newSoap)
  var sigDoc = new Dom().parseFromString(sigXml)
  var sigNode = newDoc.importNode(sigDoc.documentElement, true)

	var security = select(newDoc, 
	    "/*[local-name(.)='Envelope']/*[local-name(.)='Header']/*[local-name(.)='Security']")[0]    
  security.appendChild(sigNode)

  return newDoc
}

function WSSKeyInfo(signingToken) {
  
  this.getKeyInfo = function(key) {    
    return "<o:SecurityTokenReference>" +
           "<o:Reference URI=\"#" + signingToken.getId() +"\" " +
           "ValueType=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3\" />" +
           "</o:SecurityTokenReference>"
  }

}