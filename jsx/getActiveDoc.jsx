function getActiveDoc() {
  var doc = app.activeDocument;
  var name = doc.name;
  var url = doc.url;

  return {
    data: {
      name: name,
      url: url
    }
  };
}

var main = getActiveDoc;
