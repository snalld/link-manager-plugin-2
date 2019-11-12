function getActiveDoc() {
  var doc = app.activeDocument.name
  return { data: doc }
}

var main = getActiveDoc;
