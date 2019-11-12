function handler(event) {

  var selection = event.currentTarget.selection;

  var selectedLinks = [];

  for (var idx = 0; idx < selection.length; idx++) {
    var item = selection[idx];

    if (item instanceof Rectangle) {
      var pageItem = item.allPageItems[0];

      if (pageItem.itemLink) {
        selectedLinks.push(pageItem.itemLink.id);
      }
    }
  }

  if (new ExternalObject("lib:PlugPlugExternalObject")) {
    var eventObj = new CSXSEvent();
    eventObj.type = "com.linkmanager.updatedSelectedLinks";
    eventObj.data = JSON.stringify(selectedLinks);
    eventObj.dispatch();
  }
}

function main() {
  var eventListeners = app.activeDocument.eventListeners;
  try {
    eventListeners.remove("afterSelectionChanged", handler);
  } catch (error) {}
  eventListeners.add("afterSelectionChanged", handler);
}