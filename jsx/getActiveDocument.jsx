function getActiveDoc() {
  var doc = app.activeDocument;
  var name = doc.name;
  var path = Folder.decode(doc.filePath.path) + "/" +  name;

  return {
    data: {
      name: name,
      path: path
    }
  };
}

var main = getActiveDoc;
