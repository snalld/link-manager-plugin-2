function getLinks() {
  var doc = app.activeDocument;
  var docName = doc.name;
  var docPath = Folder.decode(doc.filePath.path) + "/" +  docName;

  var list = [];

  var links = doc.links;

  for (var i = 0; i < links.length; i++) {
    var srcLink = links[i];
    var parent = srcLink.parent;
    
    // alert(parent.parent.parent.constructor)
    
    var link = {
      documentID: docPath,
      path: srcLink.filePath,
      name: srcLink.name,
      id: srcLink.id,
      parentPage: (parent.parentPage || parent.parent.parent.pages[0]).name, // breaks on anchored objects!!! `parent.parent.parent.constructor` is `Character` instead of expected `Spread`
      source: srcLink.toSource(),
      status: (function(status) {
        if (status === LinkStatus.LINK_MISSING) return "MISSING";
        else if (status === LinkStatus.LINK_INACCESSIBLE) return "INACCESSIBLE";
        else if (status === LinkStatus.LINK_EMBEDDED) return "EMBEDDED";
        else if (status === LinkStatus.LINK_OUT_OF_DATE) return "UPDATED";
        else return "NORMAL";
      })(srcLink.status)
    };

    if (parent.hasOwnProperty("pdfAttributes")) {
      link["page"] = parent.pdfAttributes.pageNumber;
    }

    if (parent.constructor.name === "Image") {
      link["actualPPI"] = parent.actualPpi;
      link["effectivePPI"] = parent.effectivePpi;
    }

    list.push(link);
  }

  return { data: list };
}

var main = getLinks;
