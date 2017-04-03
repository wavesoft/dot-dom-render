'use strict';
const H = require('/Users/icharala/Develop/dotdom/src/dotdom').H;

//
// Extract some shorthand methods that we will use to build our virtual DOM later
//
const {div, span, p, b, ul, li} = H;

//
// A simple, parametric component
//
const Body = ({name}) =>
  div.body(
    p('Welcome to the ', b(name), '. The navigation bar on top is interactive, as well the counter below:'),
    p(H(Counter))
  )

//
// A stateful component that updates itself on every second
//
const Counter = (props, {sec}, setState) => {
  setTimeout(() => {
    setState({sec: (sec||0)+1})
  }, 1000);

  return div(
    b(`${sec || 0}`),
    ' seconds passed'
  )
}

//
// A stateful navigation bar component that responds to user
// actions and keeps a local state regarding the selected item
//
const NavBar = ({items=[]}, {selected}, setState) =>
  div.navbar(
    ul(
      ...items.map(
        (item, i) => li(
          {
            className :
              i === (selected || 0)
              ? 'active'
              : '',
            onclick() {
              setState({selected: i})
            }
          },
          item
        )
      )
    )
  )

//
// The entry point component that composes the document
//
const App = () =>
  div.app(
    H(NavBar, {
      'items': [
        'First',
        'Second',
        'Third'
      ]
    }),
    H(Body, {
      'name': '.dom playground'
    })
  )

var render = require('./lib/dot-dom-render');
console.log(render(H(App)));
