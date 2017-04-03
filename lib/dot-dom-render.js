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

function render_header(config, xmlnode) {
  const {
    title='Page',
    scripts=[],
    styles=[],
    meta={},
    charset='UTF-8'
  } = config;

  // Create title
  xmlnode.ele('title').txt(title);

  // Process scripts
  scripts.forEach(function (script) {
    if (script.src !== undefined) {
      xmlnode.ele('script').att('src', script.src);
    } else if (script.text !== undefined) {
      xmlnode.raw('script', script.text);
    } else if (typeof script === 'string') {
      xmlnode.raw('script', script);
    }
  });

  // Process styles
  styles.forEach(function (style) {
    if (style.href !== undefined) {
      xmlnode.ele('style').att('href', style.href);
    } else if (style.text !== undefined) {
      xmlnode.raw('style', style.text);
    } else if (typeof style === 'string') {
      xmlnode.raw('style', style);
    }
  });

  // Create meta-headers
  xmlnode.ele('meta').att('charset', charset);
  Object.keys(meta).forEach(function (name) {
    const content = meta[name];
    xmlnode.ele('meta').att('name', name).att('content', content);
  });
}

/**
 * Render a .dom tree into a valid HTML structure
 */
function render(tree, config={}) {
  const {
    pretty=true,
    bare=false,
    encoding='UTF-8'
  } = config;
  const root = xmlbuilder.create('html', {encoding: encoding}).dtd().up();

  // In bare mode we are rendering the raw body directly
  if (bare) {
    render_node(tree);

  // Otherwise we are rendering a proper HTML page with header and body
  } else {
    render_header(config, root.ele('head'));
    render_node(tree, root.ele('body'));
  }

  // Render and remove XML preamble
  return root.end({
    pretty: pretty,
    indent: '  ',
    newline: '\n',
    allowEmpty: false
  }).replace(/<\?xml.*?>\r?\n?/, '');
}

module.exports = render;
