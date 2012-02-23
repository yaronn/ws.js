var dom = require('xmldom').DOMParser;

function addElement(doc, parent, namespace, qualifiedName, value)
{
	var e = doc.createElementNS(namespace, qualifiedName);
	
	if (value) {
		var t = doc.createTextNode();
		t.data = value;
		e.appendChild(t);
	}

	parent.appendChild(e);
	return e;
}


function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}


function setElementValue(doc, elem, value) {
	var t = doc.createTextNode();
	t.data = value;
	elem.appendChild(t);	
}

function extractContentId(id) {
	return id.substring(1, id.length-1);
}

function parseBoundary(contentType) {		
	return contentType.match('boundary=\"(.*?)\"')[1];
}

exports.guid = guid;
exports.addElement = addElement;
exports.EMPTY_SOAP = "<Envelope xmlns='http://schemas.xmlsoap.org/soap/envelope/'><Header /><Body /></Envelope>";
exports.setElementValue = setElementValue;
exports.extractContentId = extractContentId;
exports.parseBoundary = parseBoundary;
