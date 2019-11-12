//@include "./createEventListener.jsx"

function listenToAfterActivate() {
  return createEventListener(
    "afterActivate",
    "com.linkmanager2.afterActivate",
    function() {
      return app.activeDocument.fullName;
    }
  );
}

var main = listenToAfterActivate;
