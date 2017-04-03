var xmlbuilder = require('xmlbuilder');

/**
 * Render a node into an XML node
 */
function render_node(vnode, xmlnode) {
  let element = vnode.$;

  // Render functional component
  if (typeof element === 'function') {
    vnode = element(vnode.a, {}, () => {});
    element = vnode.$;
  }

  // Process attributes and separate children
  let children = vnode.a.c;
  let attrib = Object.assign({}, vnode.a);
  delete attrib['c'];

  // Convert some attributes to an html-friendly format
  let htmlAttrib = Object.keys(attrib).reduce(function (htmlAttrib, name) {
    const value = attrib[name];

    // Replace className
    if (name === 'className') {
      if (value.trim()) {
        htmlAttrib['class'] = value.trim();
      }

    // Replace style object
    } else if (name === 'style') {
      let styleString = Object.keys(value).reduce(function (styleStr, prop) {
        if (styleStr !== '') {
          styleStr += '; ';
        }

        return styleStr + `${prop}: ${value[prop]}`;
      }, '');

    // Ignore callback functions, pass down everything else
    } else if (typeof value !== 'function') {
      htmlAttrib[name] = value;

    }

    return htmlAttrib;
  }, {});

  // Create an XMLBuilder Node
  let node = xmlnode.ele(element, htmlAttrib);

  // Process children
  children.forEach(function (child) {
    if (typeof child === 'string' || typeof child === 'number') {
      node.txt(child);
    } else {
      render_node(child, node);
    }
  });

  // Return the rendered node
  return node;
}

/**
 * Render a .dom tree into a valid HTML structure
 */
function render(tree, pretty=true) {
  let root = xmlbuilder.create('html').dtd().up();

  // Recursively render nodes
  render_node(tree, root);

  return root.end({
    pretty: pretty,
    indent: '  ',
    newline: '\n',
    allowEmpty: false
  });
}

module.exports = render;
