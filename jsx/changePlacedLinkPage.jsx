function changePlacedLinkPage(pageNumber, linkId) {
    if (pageNumber > 0) {

          try {
            var l = app.activeDocument.links.itemByID(linkId);
            var g = l.parent;
            var hs = g.horizontalScale;
            var vs = g.verticalScale;
        
            var r = g.parent;
        
            app.pdfPlacePreferences.pageNumber = pageNumber;
            app.importedPageAttributes.pageNumber = pageNumber;
        
            g.place(g.itemLink.filePath, false);
            
            g = r.graphics[0]
        
            g.horizontalScale = hs;
            g.verticalScale = vs;
        
            var newID = g.itemLink.id
            var newPageNumber = g.pdfAttributes.pageNumber
            if (pageNumber > newPageNumber) { 
                var prevPageData = changePlacedLinkPage(pageNumber - 1, newID)
                // prevPageData.data.numPages = pageNumber - 1
                return prevPageData
            }
        
            return {
              data: {
                id: newID,
                pageNumber: newPageNumber,
              }
            };
          } catch (error) {
            alert(error);
          }
    }
}

var main = changePlacedLinkPage;
