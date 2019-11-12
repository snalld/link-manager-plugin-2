//@include "./createEventListener.jsx"

function listenToAfterContextChanged() {
  return createEventListener(
    "afterContextChanged",
    "com.linkmanager2.afterContextChanged",
    function() {
      return app.activeDocument.fullName;
    }
  );
}

var main = listenToAfterContextChanged;
