var select = require('../../../xpath').SelectNodes
  , Dom = require('xmldom').DOMParser
  , utils = require('../../../utils')
  , dateFormat = require('dateformat')

exports.SecurityClientHandler = SecurityClientHandler

function SecurityClientHandler(options, tokens) {
  this.options = options || {}
  this.tokens = tokens || []
  this.security_ns = "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
  this.utility_ns = "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"
}

SecurityClientHandler.prototype.send = function(ctx, callback) {	
  var self = this
  var doc = new Dom().parseFromString(ctx.request)
  this.AddNamespaces(doc)
  var header = select(doc, "/*[local-name(.)='Envelope']/*[local-name(.)='Header']")[0]	
  ,  security = utils.addElement(doc, header, this.security_ns, "o:Security", null)
  this.AddTimestamp(doc, security)
  for (var i in this.tokens) {
    this.tokens[i].applyMe(doc, this)
  }
  ctx.request = doc.toString()
	this.next.send(ctx, function(ctx) { 
    self.receive(ctx, callback) 
  })
}

SecurityClientHandler.prototype.AddNamespaces = function(doc) {	
  doc.firstChild.setAttribute("xmlns:u", this.utility_ns)
  doc.firstChild.setAttribute("xmlns:o", this.security_ns)
}


SecurityClientHandler.prototype.AddTimestamp = function(doc, security) {		
  var timestamp = utils.addElement(doc, security, this.utility_ns, "u:Timestamp", null)
    , created_time = new Date()
    , expires_time = new Date(created_time)
    , expires_timespan = 5
	expires_time.setMinutes ( created_time.getMinutes() + expires_timespan )
	var created = utils.addElement(doc, timestamp, this.utility_ns, "u:Created", dateFormat(created_time, "isoUtcDateTime"))
	  , expires = utils.addElement(doc, timestamp, this.utility_ns, "u:Expires", dateFormat(expires_time, "isoUtcDateTime"))
}

SecurityClientHandler.prototype.receive = function(ctx, callback) {		
  callback(ctx)
}

exports.UsernameToken = UsernameToken

function UsernameToken(options) {
  this.options = options
}

UsernameToken.prototype.applyMe = function(doc, security) {	
  var security = select(doc, 
	    "/*[local-name(.)='Envelope']/*[local-name(.)='Header']/*[local-name(.)='Security']")[0]
    , token = utils.addElement(doc, security, security.security_ns, "o:UsernameToken", null)
    , username = utils.addElement(doc, token, security.security_ns, "o:Username", 
        this.options.username)
    , password = utils.addElement(doc, token, security.security_ns, "o:Password", 
        this.options.password)
  password.setAttribute("Type", 
        "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText")
}
