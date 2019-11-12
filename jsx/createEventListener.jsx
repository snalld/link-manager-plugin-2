//@include "vendor/json2.js"

function createEventListener(type, name) {
  var eventListeners = app.activeDocument.eventListeners;

  try {
    eventListeners.remove(type);
  } catch (error) {}

  var eventListener = eventListeners.add(type, function(event) {
    if (new ExternalObject("lib:PlugPlugExternalObject")) {
      var eventObj = new CSXSEvent();
      eventObj.type = name;
      eventObj.scope = "APPLICATION"
      eventObj.dispatch();
    }
  });

  return "" + eventListener.id;
}

var main = createEventListener;
