/** Execute XPath */
const select = (doc: Document, expression: string, options: {context?: Node, single?: boolean}={context: null, single: false}) => 
  doc.evaluate(expression, options.context || doc, null, options.single ? XPathResult.FIRST_ORDERED_NODE_TYPE : XPathResult.ANY_TYPE, null);

export { select }