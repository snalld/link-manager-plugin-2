export const createCEPEventSubscription = (csInterface, name) => {
  return (function(fx) {
    return function(action) {
      return [fx, { action: action }];
    };
  })(function(dispatch, props) {
    var listener = function(event) {
      dispatch(props.action, event.data);
    };
    csInterface.addEventListener(name, listener);
    return function() {
      csInterface.removeEventListener(name, listener);
    };
  });
};
