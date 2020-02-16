var node_fetch = require("node-fetch");
var HTMLParser = require("node-html-parser");


main();

function main() {

  console.log("\n\nNOW LOADING SALT & STRAW FLAVORS... \n\n")

  // Start by fetching the Salt and Straw flavors page
  node_fetch("https://saltandstraw.com/pages/flavors")
    .then(res => res.text())
    .then(body => parseHTML(body));
}

function parseHTML(text) {
  let root = HTMLParser.parse(text);

  // Find the portland flavor node
  let portlandNode = findPortlandNode(root);

  // Now parse through the portland 
  if (portlandNode != null) {
    let flavors = getFlavors(portlandNode.innerHTML);

    // Now print out all the flavors
    console.log("This month's special flavors are:")

    flavors.forEach(flavor => console.log("\t" + flavor));
  }
}

// Search the html tree for the node that has all the portland flavor information
function findPortlandNode(htmlElement) {
  let portlandNode: HTMLElement = null;
  // If this is the portland node, we'll return that
  if (htmlElement.getAttribute("id") == "portland") {
    portlandNode = htmlElement;
  }

  // Otherwise, look at the children elements
  else if (htmlElement.childNodes.length > 0) {
    let childrenNodes = htmlElement.childNodes;

    // Go through all the children nodes and recursively search for the portland 
    // node
    for (var i = 0; i < childrenNodes.length; i++) {
      let child = childrenNodes[i];

      // We only want to search element node, and I know that the element node type
      // is 1
      if (child.nodeType == 1) {
        portlandNode = findPortlandNode(child);

        if (portlandNode != null) {
          break;
        }
      }
    }
  }

  return portlandNode;
}

// Take the inner HTML from the portland tag and parse it for "strong" tags
function getFlavors(portlandHTML: string): Set<string> {
  // We'll just use reg-ex here, it's brute-force, but it'll work
  let pattern = /(<strong>)(.+)(<\/strong>)/g
  let regEx = new RegExp(pattern);


  let flavors: Set<string> = new Set();

  // Find all the flavor tags
  let patternResults = regEx.exec(portlandHTML);
  while (patternResults) {
    let flavor: string = patternResults[2];

    // We'll keep track of all the unique flavors we find
    flavors.add(flavor);
    patternResults = regEx.exec(portlandHTML);
  }

  return flavors;
}