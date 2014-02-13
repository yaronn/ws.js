var dom = require('xmldom').DOMParser

function appendElement(doc, parent, namespace, qualifiedName, value) {
  var e = doc.createElementNS(namespace, qualifiedName)	
  if (value) {
    var t = doc.createTextNode();
    t.data = value
    e.appendChild(t)
  }
  parent.appendChild(e)
  return e
}

function findAttr(node, localName, namespace) {  
  for (var i = 0; i<node.attributes.length; i++) {
    var attr = node.attributes[i]    
    if (attrEqualsExplicitly(attr, localName, namespace) || attrEqualsImplicitly(attr, localName, namespace, node)) {                     
      return attr
    }
  }

  return null
}

function attrEqualsExplicitly(attr, localName, namespace) {
  //console.log(attr.localName + ":" + attr.namespaceURI + " vs. " + localName + ":" + namespace)
  return attr.localName==localName && (attr.namespaceURI==namespace || !namespace)
}

function attrEqualsImplicitly(attr, localName, namespace, node) {  
  return attr.localName==localName && ((!attr.namespaceURI && node.namespaceURI==namespace) || !namespace)
}

//limitation: only works when adding a sibling to a child with no siblings
//the root problem is that _insertBefore in dom.js has bugs in it
function prependElement(doc, parent, namespace, qualifiedName, value) {
  
  if (!parent.firstChild) {
    appendElement(doc, parent, namespace, qualifiedName, value);
    return;
  }

  var e = doc.createElementNS(namespace, qualifiedName) 
  if (value) {
    var t = doc.createTextNode();
    t.data = value  
    e.appendChild(t)          
  }
  
  var oldFirst = parent.firstChild
  parent.removeChild(parent.firstChild)
  parent.appendChild(e)
  parent.appendChild(oldFirst)

  return e
}

function guid() {

  var S4 = function() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1)
  }

  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4())
}

function setElementValue(doc, elem, value) {
  var t = doc.createTextNode()
  t.data = value
  elem.appendChild(t)	
}

function extractContentId(id) {
  return id.substring(1, id.length-1)
}

function parseBoundary(contentType) {		
  return contentType.match('boundary=\"(.*?)\"')[1]
}

function dateDiffInMin(d1, d2) {
  var milliseconds_in_second = 1000
  , seconds_in_minute = 60

  return parseInt((d2-d1)/(seconds_in_minute*milliseconds_in_second))
}

function getTypeName(obj) {
  var funcNameRegex = /function (.{1,})\(/
  , results = (funcNameRegex).exec(obj.constructor.toString());
  return (results && results.length > 1) ? results[1] : ""
}

exports.guid = guid
exports.appendElement = appendElement
exports.prependElement = prependElement
exports.EMPTY_SOAP = 
  "<Envelope xmlns='http://schemas.xmlsoap.org/soap/envelope/'><Header /><Body /></Envelope>"
exports.setElementValue = setElementValue
exports.extractContentId = extractContentId
exports.parseBoundary = parseBoundary
exports.dateDiffInMin = dateDiffInMin
exports.getTypeName = getTypeName
exports.findAttr = findAttr


