import { formatDate } from "@angular/common";

/** Execute XPath */
const select = (doc: Document, expression: string, options: {context?: Node, single?: boolean}={context: null, single: false}) => 
  doc.evaluate(expression, options.context || doc, null, options.single ? XPathResult.FIRST_ORDERED_NODE_TYPE : XPathResult.ANY_TYPE, null);

/** NodeList To Array */
const nodesToArray = (xPathResult: XPathResult): Array<string> => {
  let arr = [];
  let node = xPathResult.iterateNext();
  while (node) {
    arr.push(node.textContent);
    node = xPathResult.iterateNext();
  } 
  return arr;
}

/** Return date as string */
const dateString = str => {
  try {
    return formatDate(str, "yyyy-MM-dd", "en-GB") 
  } catch {
    return '';
  }
}

const escapeXml = (str: string) => {
  return str.replace(/[<>&]/g, function (c) {
      switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
      }
  });
}

export { select, nodesToArray, dateString, escapeXml }