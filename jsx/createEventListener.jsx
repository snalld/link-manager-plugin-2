//@include "vendor/json2.js"

function createHandler(name) {
  return function handler() {
    if (new ExternalObject("lib:PlugPlugExternalObject")) {
      var eventObj = new CSXSEvent();
      eventObj.type = name;
      eventObj.scope = "APPLICATION"
      eventObj.dispatch();
    }
  }
}

function createEventListener(type, name) {
  var eventListeners = app.activeDocument.eventListeners;

  var eventListener = eventListeners.add(type, createHandler(name));

  return { 
    data: {
      listener: eventListener.toSource(),
      document: doc.toSource()
    }
  }
}

var main = createEventListener;
