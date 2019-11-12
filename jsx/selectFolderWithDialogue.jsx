function selectFolderWithDialogue(path) {
  var f = new Folder(path);
  return f.selectDlg();
}

exports = selectFolderWithDialogue;
