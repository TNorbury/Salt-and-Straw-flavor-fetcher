var node_fetch = require("node-fetch");
var HTMLParser = require("node-html-parser");
const argv = require('yargs').argv


const cities: Array<string> = ["portland", "los-angeles", "san-diego", "san-francisco", "seattle", "anaheim"];

main();

function main() {
  // default city is portland
  let city: string = "portland";

  // Get the optional city argument, and if it's valid, use it
  if (argv.city != null) {
    if (cities.includes(argv.city)) {
      city = argv.city;
    }

    // If an invalid city is given, print out all the valid options and exit
    else {
      console.log("Invalid city argument, the valid city options are:");
      cities.forEach(city => console.log(city));
      return;
    }
  }

  console.log("\n\nNOW LOADING SALT & STRAW FLAVORS... \n\n")

  // Start by fetching the Salt and Straw flavors page
  node_fetch("https://saltandstraw.com/pages/flavors")
    .then(res => res.text())
    .then(body => parseHTML(body, city));
  }
  
  function parseHTML(text: string, city: string) {
    let root: HTMLElement = HTMLParser.parse(text);
    
    // Find the node for the city we're looking for
    let cityNode = findCityNode(root, city);
    
    // Now parse through that city's node 
    if (cityNode != null) {
      let flavors = getFlavors(cityNode.innerHTML);
      
      // Now print out all the flavors
      console.log("This month's special flavors are:")
      
      flavors.forEach(flavor => console.log("\t" + flavor.trim()));

      console.log("");
  }
}

// Search the html tree for the node that has all the city's flavor information
function findCityNode(htmlElement: HTMLElement, city: string) {
  let cityNode: HTMLElement = null;

  // If this is the city node we're looking for, we'll return that
  if (htmlElement.getAttribute("id") == city) {
    cityNode = htmlElement;
  }

  // Otherwise, look at the children elements and see if we can find it
  else if (htmlElement.childNodes.length > 0) {
    let childrenNodes = htmlElement.childNodes;

    // Go through all the children nodes and recursively search for the city node 
    for (var i = 0; i < childrenNodes.length; i++) {
      let child = childrenNodes[i];

      // We only want to search html nodes, and I know that the html node type
      // is 1
      if (child.nodeType == 1) {
        cityNode = findCityNode(child as HTMLElement, city);

        if (cityNode != null) {
          break;
        }
      }
    }
  }

  return cityNode;
}

// Take the inner HTML from the city tag and parse it for "strong" tags
function getFlavors(cityHTML: string): Set<string> {
  // We'll just use reg-ex here, it's brute-force, but it'll work
  let pattern = /(<strong>)(.+)(<\/strong>)/g
  let regEx = new RegExp(pattern);


  let flavors: Set<string> = new Set();

  // Find all the flavor tags
  let patternResults = regEx.exec(cityHTML);
  while (patternResults) {
    let flavor: string = patternResults[2].trim();

    // No empty flavors
    if (flavor != "") {
      // We'll keep track of all the unique flavors we find
      flavors.add(flavor);
    }

    patternResults = regEx.exec(cityHTML);
  }

  return flavors;
}