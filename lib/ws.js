var select = require('./xpath').SelectNodes
  , Dom = require('xmldom').DOMParser
  , fs = require('fs')
  , utils = require('./utils')

exports.Http = require('./handlers/client/http.js').HttpClientHandler
exports.Addr = require('./handlers/client/addressing.js').WsAddressingClientHandler
exports.Mtom = require('./handlers/client/mtom/mtom.js').MtomClientHandler
exports.Security = require('./handlers/client/security/security.js').SecurityClientHandler
exports.UsernameToken = require('./handlers/client/security/security.js').UsernameToken
exports.X509BinarySecurityToken = require('./handlers/client/security/security.js').X509BinarySecurityToken
exports.Signature = require('./handlers/client/security/signature.js').Signature

exports.send = send
exports.addAttachment = addAttachment
exports.getAttachment = getAttachment

function send(handlers, ctx, callback) {
  ensureHasSoapHeader(ctx)

  for (i=0; i<handlers.length-1; i++)	{    
    handlers[i].next = handlers[i+1]
  }
  handlers[0].send(ctx, function(ctx) {
    //some handlers may leave response as a buffer so we need to make sure it is string
    if (ctx.response) ctx.response = ctx.response.toString()
    callback(ctx)
  })
}

function ensureHasSoapHeader(ctx) {  
  var doc = new Dom().parseFromString(ctx.request)
  , header = select(doc, "/*[local-name(.)='Envelope']/*[local-name(.)='Header']")
  , qname = doc.firstChild.prefix==null ? "" : doc.firstChild.prefix + ":"  
  qname += "Header"
  if (header.length==0) {
    utils.prependElement(doc, doc.firstChild, doc.firstChild.namespaceURI, qname, null)
  }

  ctx.request = doc.toString()
}

function isArray(obj) {
  return typeof(obj)=='object' && (obj instanceof Array)
}

function addAttachment(ctx, property, xpath, file, contentType) {
  var prop = eval("ctx." + property)
  , doc = new Dom().parseFromString(prop)	
  , elem = select(doc, xpath)[0]
  , content = fs.readFileSync(file).toString("base64")
	
  utils.setElementValue(doc, elem, content)		
  eval("ctx." + property + " = doc.toString()");		
  if (!ctx.base64Elements) ctx.base64Elements = []		
  ctx.base64Elements.push({xpath: xpath, contentType: contentType});
}

function getAttachment(ctx, property, xpath) {		
  var prop = eval("ctx." + property)		
  , doc = new Dom().parseFromString(prop)
  , elem = select(doc, xpath)[0]

  return new Buffer(elem.firstChild.data, "base64")
}