var select = require('../../lib/xpath').SelectNodes
  , dom = require('xmldom').DOMParser
  , utils = require('../../lib/utils')


function buildXpath(local, ns) {
  var xpath = "//*["
  if (ns) xpath += "namespace-uri(.)='"+ns+"' and "
  xpath += "local-name(.)='"+local+"']"
  return xpath
}

function nodeEquals(test, doc, ns, local, expected) {  
  var xpath = buildXpath(local, ns)

  var node = select(doc, xpath)
  test.ok(node.length==1, "node " + ns + ":" + local + " not found");
  test.ok(node[0].firstChild.data==expected, 
    "invalid value for node " + ns + ":" + local + ". expected: " + 
    expected + " found: " + node[0].firstChild.data
  );
  return node 
}

function attrEquals(test, doc, nodeNs, nodeName, attrName, expected) {
  var xpath = buildXpath(nodeName, nodeNs)    
  var nodes = select(doc, xpath)
  if (nodes.length==0) test.fail("could not find " + nodeName + ":" + nodeNs)
  var attr = utils.findAttr(nodes[0], attrName)  

  test.ok(attr, "attribute " + attrName + " not found");
  test.ok(attr.value==expected,
    "invalid value for attribute " + attrName + ". expected: " + 
    expected + " found: " + attr.data
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
exports.attrEquals = attrEquals