function getSelectedLinkIDs() {
  
  var selection = app.activeDocument.selection;

  var selectedLinks = [];

  for (var idx = 0; idx < selection.length; idx++) {
    var item = selection[idx];

    if (item instanceof Rectangle) {
      var pageItem = item.allPageItems[0];

      if (pageItem.hasOwnProperty("itemLink") && pageItem.itemLink) {
        selectedLinks.push(pageItem.itemLink.id);
      }
    }
  }

  return { data: selectedLinks };
}

var main = getSelectedLinkIDs;
