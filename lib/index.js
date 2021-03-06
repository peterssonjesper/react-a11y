var assertions = require('./assertions');

var assertAccessibility = (tagName, props, children) => {
  var key;
  var failures = [];

  var tagTests = assertions.tags[tagName] || [];
  for (key in tagTests)
    if (tagTests[key] && !tagTests[key].test(tagName, props, children))
      failures.push(tagTests[key].msg);

  var propTests;
  for (var propName in props) {
    if (props[propName] === null || props[propName] === undefined) continue;
    propTests = assertions.props[propName] || [];
    for (key in propTests)
      if (propTests[key] && !propTests[key].test(tagName, props, children))
        failures.push(propTests[key].msg);
  }
  return failures;
};

var error = (id, msg) => {
  throw new Error('#' + id + ": " + msg);
};

var warn = (id, msg) => {
  console.warn('#' + id, msg);
};

var nextId = 0;
module.exports = (React, options) => {
  if (!React && !React.createElement) {
    throw new Error('Missing parameter: React');
  }
  assertions.setReact(React);

  var _createElement = React.createElement;
  var log = options && options.throw ? error : warn;
  React.createElement = function (type, _props, ...children) {
    var props = _props || {};
    if (typeof type === 'string') {
      var failures = assertAccessibility(type, props, children);
      if (failures.length) {
        // Generate an id if one doesn't exist
        props.id = (props.id || 'a11y-' + nextId++);

        for (var i = 0; i < failures.length; i++)
          log(props.id, failures[i]);
      }
    }
    // make sure props with the id is passed down, even if no props were passed in.
    return _createElement.apply(this, [type, props].concat(children));
  };
};
