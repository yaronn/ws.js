var select = require('../../lib/xpath').SelectNodes
  , dom = require('xmldom').DOMParser

function nodeEquals(test, doc, ns, local, expected) {
  var node = select(doc, "//*[namespace-uri(.)='"+ns+"' and local-name(.)='"+local+"']");    
  test.ok(node.length==1, "node " + ns + ":" + local + " not found");
  test.ok(node[0].firstChild.data==expected, 
    "invalid value for node " + ns + ":" + local + ". expected: " + 
    expected + " found: " + node[0].firstChild.data
  );    
}

function nodeCallback(test, doc, ns, local, callback) {
  var node = select(doc, "//*[namespace-uri(.)='"+ns+"' and local-name(.)='"+local+"']");    
  test.ok(node.length==1, "node " + ns + ":" + local + " not found");
  callback(node[0]);
}

function xpathCallback(test, doc, xpath, callback) {
  var node = select(doc, xpath);
  test.ok(node.length==1, "xpath: " + xpath + " not found");
  callback(node[0]);
}

exports.nodeEquals = nodeEquals;
exports.nodeCallback = nodeCallback;
exports.xpathCallback = xpathCallback;