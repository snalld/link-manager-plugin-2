function relink(source, path) {
  var link = eval(source);

  try {
    var f = new File(path);

    alert(link.parent.constructor.name)

    link.relink(f);
    return linkToJSON(link);
  } catch (e) {
    return (
      "Error: Could not relink " +
      link.filePath.split(":").join("/") +
      " to " +
      path
    );
  }
}

function linkToJSON(link) {
  var object = {
    path: link.filePath,
    name: link.name,
    id: link.id,
    location: (link.parent.parentPage || link.parent.parent.parent.pages[0])
      .name,
    source: link.toSource(),
    status: (function(status) {
      if (status === LinkStatus.LINK_MISSING) return "MISSING";
      else if (status === LinkStatus.LINK_INACCESSIBLE) return "INACCESSIBLE";
      else if (status === LinkStatus.LINK_EMBEDDED) return "EMBEDDED";
      else if (status === LinkStatus.LINK_OUT_OF_DATE) return "UPDATED";
      else return "NORMAL";
    })(link.status)
  };

  if (link.parent.imageTypeName.indexOf("PDF") > -1) {
    object["page"] = link.parent.pdfAttributes.pageNumber;
  }

  return JSON.stringify(object);
}

exports = relink;
