function getActiveDoc() {
  var doc = app.activeDocument;
  var name = doc.name;
  var path = Folder.decode(doc.filePath.path) + "/" +  name;
  var id = doc.id;

  return {
    data: {
      name: name,
      path: path,
      id: id
    }
  };
}

var main = getActiveDoc;
