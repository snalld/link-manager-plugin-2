function main(filepath) {
  var file = new File(filepath);

  // load XMP Library
  function loadXMPLibrary() {
    if (!ExternalObject.AdobeXMPScript) {
      try {
        ExternalObject.AdobeXMPScript = new ExternalObject(
          "lib:AdobeXMPScript"
        );
      } catch (e) {
        alert("Unable to load the AdobeXMPScript library!");
        return false;
      }
    }
    return true;
  }

  // check selection
  if (
    loadXMPLibrary() &&
    app.selection.length == 1 &&
    app.selection[0].contentType == ContentType.GRAPHIC_TYPE
  ) {
    var myFile = File(app.selection[0].graphics[0].itemLink.filePath);
    // load XMP from file
    xmpFile = new XMPFile(
      myFile.fsName,
      XMPConst.UNKNOWN,
      XMPConst.OPEN_FOR_READ
    );
    var myXmp = xmpFile.getXMP();
    //close file
    xmpFile.closeFile(XMPConst.CLOSE_UPDATE_SAFELY);
  }

  if (myXmp) {
    var myPreviews = Array();

    // node checks
    var numThumbs = myXmp.countArrayItems(XMPConst.NS_XMP, "Thumbnails");
    var numPages = myXmp.countArrayItems(XMPConst.NS_XMP, "PageInfo");

    // // data check
    // if(thumbCnt != 0){
    //     pagePrevCnt = thumbCnt;
    //     XMPnode = "Thumbnails";
    // }else if(pagInfCnt != 0){
    //     pagePrevCnt = pagInfCnt;
    //     XMPnode = "PageInfo";
    // }else{
    //     alert("No Data saved");
    //     exit();
    // }

    // loop through preview nodes
    // for(var i = 1; i <= pagePrevCnt; i++){
    //     var myTemp = String(myXmp.getProperty(XMPConst.NS_XMP, XMPnode+"[" + i + "]/xmpGImg:image"));
    //     myTemp = myTemp.replace("/*missing*/","\n");
    //     myPreviews.push(myTemp);
    // }
  }

  return {
    data: myXmp.serialize()
  };
}

/*********************************************/
/*                                                                */
/*        PDF READER SECTION           */
/*  Extracts count and size of pages    */
/*                                                                */
/********************************************/

// Extract info from the PDF file.
// getSize is a boolean that will also determine page size and rotation of first page
// *** File position changes in this function. ***
// Results are as follows:
// page count = retArray.pgCount
// page width = retArray.pgSize.pgWidth
// page height = retArray.pgSize.pgHeight
function getPDFInfo(theFile, getSize) {
  var flag = 0; // used to keep track if the %EOF line was encountered
  var nlCount = 0; // number of newline characters per line (1 or 2)

  // The array to hold return values
  var retArray = new Array();
  retArray["pgCount"] = -1;
  retArray["pgSize"] = null;

  // Open the PDF file for reading
  theFile.open("r");

  // Search for %EOF line
  // This skips any garbage at the end of the file
  // if FOE% is encountered (%EOF read backwards), flag will be 15
  for (i = 0; flag != 15; i++) {
    theFile.seek(i, 2);
    switch (theFile.readch()) {
      case "F":
        flag |= 1;
        break;
      case "O":
        flag |= 2;
        break;
      case "E":
        flag |= 4;
        break;
      case "%":
        flag |= 8;
        break;
      default:
        flag = 0;
        break;
    }
  }
  // Jump back a small distance to allow going forward more easily
  theFile.seek(theFile.tell() - 100);

  // Read until startxref section is reached
  while (theFile.readln() != "startxref");

  // Set the position of the first xref section
  var xrefPos = parseInt(theFile.readln(), 10);

  // The array for all the xref sections
  var xrefArray = new Array();

  // Go to the xref section
  theFile.seek(xrefPos);

  // Determine length of xref entries
  // (not all PDFs are compliant with the requirement of 20 char/entry)
  xrefArray["lineLen"] = determineLineLen(theFile);

  // Get all the xref sections
  while (xrefPos != -1) {
    // Go to next section
    theFile.seek(xrefPos);

    // Make sure it's an xref line we went to, otherwise PDF is no good
    if (theFile.readln() != "xref") {
      throwError("Cannot determine page count.", true, 99, theFile);
    }

    // Add the current xref section into the main array
    xrefArray[xrefArray.length] = makeXrefEntry(theFile, xrefArray.lineLen);

    // See if there are any more xref sections
    xrefPos = xrefArray[xrefArray.length - 1].prevXref;
  }

  // Go get the location of the /Catalog section (the /Root obj)
  var objRef = -1;
  for (i = 0; i < xrefArray.length; i++) {
    objRef = xrefArray[i].rootObj;
    if (objRef != -1) {
      i = xrefArray.length;
    }
  }

  // Double check root obj was found
  if (objRef == -1) {
    throwError("Unable to find Root object.", true, 98, theFile);
  }

  // Get the offset of the root section and set file position to it
  var theOffset = getByteOffset(objRef, xrefArray);
  theFile.seek(theOffset);

  // Determine the obj where the first page is located
  objRef = getRootPageNode(theFile);

  // Get the offset where the root page nod is located and set the file position to it
  theOffset = getByteOffset(objRef, xrefArray);
  theFile.seek(theOffset);

  // Get the page count info from the root page tree node section
  retArray.pgCount = readPageCount(theFile);

  // Does user need size also? If so, get size info
  if (getSize) {
    // Go back to root page tree node
    theFile.seek(theOffset);

    // Flag to tell if page tree root was visited already
    var rootFlag = false;

    // Loop until an actual page obj is found (page tree leaf)
    do {
      var getOut = true;

      if (rootFlag) {
        // Try to find the line with the /Kids entry
        // Also look for instance when MediBox is in the root obj
        do {
          var tempLine = theFile.readln();
        } while (
          tempLine.indexOf("/Kids") == -1 &&
          tempLine.indexOf(">>") == -1
        );
      } else {
        // Try to first find the line with the /MediaBox entry
        rootFlag = true; // Indicate root page tree was visited
        getOut = false; // Force loop if /MediaBox isn't found here
        do {
          var tempLine = theFile.readln();
          if (tempLine.indexOf("/MediaBox") != -1) {
            getOut = true;
            break;
          }
        } while (tempLine.indexOf(">>") == -1);

        if (!getOut) {
          // Reset the file pointer to the beginning of the root obj again
          theFile.seek(theOffset);
        }
      }

      // If /Kids entry was found, still at an internal page tree node
      if (tempLine.indexOf("/Kids") != -1) {
        // Check if the array is on the same line
        if (tempLine.indexOf("R") != -1) {
          // Grab the obj ref for the first page
          objRef = parseInt(tempLine.split("/Kids")[1].split("[")[1]);
        } else {
          // Go down one line
          tempLine = theFile.readln();

          // Check if the opening bracket is on this line
          if (tempLine.indexOf("[") != -1) {
            // Grab the obj ref for the first page
            objRef = parseInt(tempLine.split("[")[1]);
          } else {
            // Grab the obj ref for the first page
            objRef = parseInt(tempLine);
          }
        }

        // Get the file offset for the page obj and set file pos to it
        theOffset = getByteOffset(objRef, xrefArray);
        theFile.seek(theOffset);
        getOut = false;
      }
    } while (!getOut);

    // Make sure file position is correct if finally at a leaf
    theFile.seek(theOffset);

    // Go get the page sizes
    retArray.pgSize = getPageSize(theFile);
  }

  // Close the PDF file, finally all done!
  theFile.close();

  return retArray;
}

// Function to create an array of xref info
// File position must be set to second line of xref section
// *** File position changes in this function. ***
function makeXrefEntry(theFile, lineLen) {
  var newEntry = new Array();
  newEntry["theSects"] = new Array();
  var tempLine = theFile.readln();

  // Save info
  newEntry.theSects[0] = makeXrefSection(tempLine, theFile.tell());

  // Try to get to trailer line
  var xrefSec = newEntry.theSects[newEntry.theSects.length - 1].refPos;
  var numObjs = newEntry.theSects[newEntry.theSects.length - 1].numObjs;
  do {
    var getOut = true;
    for (i = 0; i < numObjs; i++) {
      theFile.readln(); // get past the objects: tell( ) method is all screwed up in CS4
    }
    tempLine = theFile.readln();
    if (tempLine.indexOf("trailer") == -1) {
      // Found another xref section, create an entry for it
      var tempArray = makeXrefSection(tempLine, theFile.tell());
      newEntry.theSects[newEntry.theSects.length] = tempArray;
      xrefSec = tempArray.refPos;
      numObjs = tempArray.numObjs;
      getOut = false;
    }
  } while (!getOut);

  // Read line with trailer dict info in it
  // Need to get /Root object ref
  newEntry["rootObj"] = -1;
  newEntry["prevXref"] = -1;
  do {
    tempLine = theFile.readln();
    if (tempLine.indexOf("/Root") != -1) {
      // Extract the obj location where the root of the page tree is located:
      newEntry.rootObj = parseInt(
        tempLine.substring(tempLine.indexOf("/Root") + 5),
        10
      );
    }
    if (tempLine.indexOf("/Prev") != -1) {
      newEntry.prevXref = parseInt(
        tempLine.substring(tempLine.indexOf("/Prev") + 5),
        10
      );
    }
  } while (tempLine.indexOf(">>") == -1);

  return newEntry;
}

// Function to save xref info to a given array
function makeXrefSection(theLine, thePos) {
  var tempArray = new Array();
  var temp = theLine.split(" ");
  tempArray["startObj"] = parseInt(temp[0], 10);
  tempArray["numObjs"] = parseInt(temp[1], 10);
  tempArray["refPos"] = thePos;
  return tempArray;
}

// Function that gets the page count form a root page section
// *** File position changes in this function. ***
function readPageCount(theFile) {
  // Read in first line of section
  var theLine = theFile.readln();

  // Locate the line containing the /Count entry
  while (theLine.indexOf("/Count") == -1) {
    theLine = theFile.readln();
  }

  // Extract the page count
  return parseInt(theLine.substring(theLine.indexOf("/Count") + 6), 10);
}

// Function to determine length of xref entries
// Not all PDFs conform to the 20 char/entry requirement
// *** File position changes in this function. ***
function determineLineLen(theFile) {
  // Skip xref line
  theFile.readln();
  var lineLen = -1;

  // Loop trying to find lineLen
  do {
    var getOut = true;
    var tempLine = theFile.readln();
    if (tempLine != "trailer") {
      // Get the number of object enteries in this section
      var numObj = parseInt(tempLine.split(" ")[1]);

      // If there is more than one entry in this section, use them to determime lineLen
      if (numObj > 1) {
        theFile.readln();
        var tempPos = theFile.tell();
        theFile.readln();
        lineLen = theFile.tell() - tempPos;
      } else {
        if (numObj == 1) {
          // Skip the single entry
          theFile.readln();
        }
        getOut = false;
      }
    } else {
      // Read next line(s) and extract previous xref section
      var getOut = false;
      do {
        tempLine = theFile.readln();
        if (tempLine.indexOf("/Prev") != -1) {
          theFile.seek(
            parseInt(tempLine.substring(tempLine.indexOf("/Prev") + 5))
          );
          getOut = true;
        }
      } while (tempLine.indexOf(">>") == -1 && !getOut);
      theFile.readln(); // Skip the xref line
      getOut = false;
    }
  } while (!getOut);

  // Check if there was a problem determining the line length
  if (lineLen == -1) {
    throwError(
      "Unable to determine xref dictionary line length.",
      true,
      97,
      theFile
    );
  }

  return lineLen;
}

// Function that determines the byte offset of an object number
// Searches the built array of xref sections and reads the offset for theObj
// *** File position changes in this function. ***
function getByteOffset(theObj, xrefArray) {
  var theOffset = -1;

  // Look for the theObj in all sections found previously
  for (i = 0; i < xrefArray.length; i++) {
    var tempArray = xrefArray[i];
    for (j = 0; j < tempArray.theSects.length; j++) {
      var tempArray2 = tempArray.theSects[j];

      // See if theObj falls within this section
      if (
        tempArray2.startObj <= theObj &&
        theObj <= tempArray2.startObj + tempArray2.numObjs - 1
      ) {
        theFile.seek(
          tempArray2.refPos + (theObj - tempArray2.startObj) * xrefArray.lineLen
        );

        // Get the location of the obj
        var tempLine = theFile.readln();

        // Check if this is an old obj, if so ignore it
        // An xref entry with n is live, with f is not
        if (tempLine.indexOf("n") != -1) {
          theOffset = parseInt(tempLine, 10);

          // Cleanly get out of both loops
          j = tempArray.theSects.length;
          i = xrefArray.length;
        }
      }
    }
  }

  return theOffset;
}

// Function to extract the root page node object from a section
// File position must be at the start of the root page node
// *** File position changes in this function. ***
function getRootPageNode(theFile) {
  var tempLine = theFile.readln();

  // Go to line with /Page token in it
  while (tempLine.indexOf("/Pages") == -1) {
    tempLine = theFile.readln();
  }

  // Extract the root page obj number
  return parseInt(tempLine.substring(tempLine.indexOf("/Pages") + 6), 10);
}

// Function to extract the sizes from a page reference section
// File position must be at the start of the page object
// *** File position changes in this function. ***
function getPageSize(theFile) {
  var hasTrimBox = false; // Prevent MediaBox from overwriting TrimBox info
  var charOffset = -1;
  var isRotated = false; // Page rotated 90 or 270 degrees?
  var foundSize = false; // Was a size found?
  do {
    var theLine = theFile.readln();
    if (!hasTrimBox && (charOffset = theLine.indexOf("/MediaBox")) != -1) {
      // Is the array on the same line?
      if (theLine.indexOf("[", charOffset + 9) == -1) {
        // Need to go down one line to find the array
        theLine = theFile.readln();
        // Extract the values of the MediaBox array (x1, y1, x2, y2)
        var theNums = theLine
          .split("[")[1]
          .split("]")[0]
          .split(" ");
      } else {
        // Extract the values of the MediaBox array (x1, y1, x2, y2)
        var theNums = theLine
          .split("/MediaBox")[1]
          .split("[")[1]
          .split("]")[0]
          .split(" ");
      }

      // Take care of leading space
      if (theNums[0] == "") {
        theNums = theNums.slice(1);
      }

      foundSize = true;
    }
    if ((charOffset = theLine.indexOf("/TrimBox")) != -1) {
      // Is the array on the same line?
      if (theLine.indexOf("[", charOffset + 8) == -1) {
        // Need to go down one line to find the array
        theLine = theFile.readln();
        // Extract the values of the MediaBox array (x1, y1, x2, y2)
        var theNums = theLine
          .split("[")[1]
          .split("]")[0]
          .split(" ");
      } else {
        // Extract the values of the MediaBox array (x1, y1, x2, y2)
        var theNums = theLine
          .split("/TrimBox")[1]
          .split("[")[1]
          .split("]")[0]
          .split(" ");
      }

      // Prevent MediaBox overwriting TrimBox values
      hasTrimBox = true;

      // Take care of leading space
      if (theNums[0] == "") {
        theNums = theNums.slice(1);
      }

      foundSize = true;
    }
    if ((charOffset = theLine.indexOf("/Rotate")) != 1) {
      var rotVal = parseInt(theLine.substring(charOffset + 7));
      if (rotVal == 90 || rotVal == 270) {
        isRotated = true;
      }
    }
  } while (theLine.indexOf(">>") == -1);

  // Check if a size array wasn't found
  if (!foundSize) {
    throwError("Unable to determine PDF page size.", true, 96, theFile);
  }

  // Do the math
  var xSize = parseFloat(theNums[2]) - parseFloat(theNums[0]);
  var ySize = parseFloat(theNums[3]) - parseFloat(theNums[1]);

  // One last check that sizes are actually numbers
  if (isNaN(xSize) || isNaN(ySize)) {
    throwError(
      "One or both page dimensions could not be calculated.",
      true,
      95,
      theFile
    );
  }

  // Use rotation to determine orientation of pages
  var ret = new Array();
  ret["width"] = isRotated ? ySize : xSize;
  ret["height"] = isRotated ? xSize : ySize;

  return ret;
}

// Error function
function throwError(msg, pdfError, idNum, fileToClose) {
  if (fileToClose != null) {
    fileToClose.close();
  }

  if (pdfError) {
    // Throw err to be able to turn page numbering off
    throw Error("dummy");
  } else {
    alert(
      "ERROR: " + msg + " (" + idNum + ")",
      "MultiPageImporter Script Error"
    );
    exit(idNum);
  }
}

// Extract info from the document being placed
// Need to open without showing window and then close it
// right after collecting the info
function getINDinfo(theDoc) {
  // Open it
  var temp = app.open(theDoc, false);
  var placementINFO = new Array();
  var pgSize = new Array();
  // Get info as needed
  placementINFO["pgCount"] = temp.pages.length;
  pgSize["height"] = temp.documentPreferences.pageHeight;
  pgSize["width"] = temp.documentPreferences.pageWidth;
  placementINFO["vUnits"] = temp.viewPreferences.verticalMeasurementUnits;
  placementINFO["hUnits"] = temp.viewPreferences.horizontalMeasurementUnits;
  placementINFO["pgSize"] = pgSize;
  // Close the document
  temp.close(SaveOptions.NO);
  return placementINFO;
}

// File filter for the mac to only show indy and pdf files
function macFileFilter(fileToTest) {
  if (
    fileToTest.name.indexOf(".pdf") > -1 ||
    fileToTest.name.indexOf(".ind") > -1
  )
    return true;
  else return false;
}

/* HELPER FUNCTIONS FOR THE DIALOG WINDOW */

// Enable/disable Keep Props, Bleed Fit, Scale boxes and Offset boxes when Fit Page is un/checked
function onFitPageClicked() {
  dLog.keepProp.enabled = dLog.fitPage.value;
  dLog.addBleed.enabled = dLog.fitPage.value;
  dLog.percX.enabled = !dLog.fitPage.value;
  dLog.percY.enabled = !dLog.fitPage.value;
}

// Take care of OK beng clicked
function onOKclicked() {
  dLog.close(1);
}

// Take care of Cancel beng clicked
function onCANclicked() {
  dLog.close(0);
}

// Validate the start page
function startPGValidator() {
  pageValidator(dLog.startPG, placementINFO.pgCount, "start");
}

// Validate the end page
function endPGValidator() {
  pageValidator(dLog.endPG, placementINFO.pgCount, "end");
}

// Validate the document start page
function docStartPGValidator() {
  pageValidator(dLog.docStartPG, docPgCount, "Start Placing on Doc Page");
}

// Actual page validator
function pageValidator(me, max, boxType) {
  errType = "Invalid Page Number Error";
  temp = new Number(me.text);
  if (isNaN(temp)) {
    alert("Please enter '" + boxType + "' page as a number.", errType);
    me.text = "1";
  } else if (temp < 1) {
    alert("The '" + boxType + "' page number must be at least 1.", errType);
    me.text = "1";
  } else if (temp > max) {
    alert(
      "The '" + boxType + "' page number must be " + max + " or less.",
      errType
    );
    me.text = max;
  }

  // Make sure the new page range doesn't circumvent the mapPGValidator
  if (noPDFError) {
    mapPGValidator();
  }
}

// Validate entered text for the percX box
function percXValidator() {
  percentageValidator(dLog.percX, "X");
}

// Validate entered text for the percY box
function percYValidator() {
  percentageValidator(dLog.percY, "Y");
}

// Validator for the percentage boxes
function percentageValidator(me, boxType) {
  temp = new Number(me.text);
  if (isNaN(temp)) {
    alert(
      "Please enter a number in the " + boxType + " percentage box!",
      "Invalid Percentage Error"
    );
    me.text = "100";
  } else if (temp < 1 || temp > 400) {
    alert(
      "Value must be between 1% and 400% in the " +
        boxType +
        " percentage box!",
      "Invalid Percentage Error"
    );
    me.text = "100 ";
  }
}

// Validate entered text for the X offset box
function offsetXValidator() {
  offsetValidator(dLog.offsetX, "X");
}

// Validate entered text for the Y offset box
function offsetYValidator() {
  offsetValidator(dLog.offsetY, "Y");
}

// Actaul Validator for the offset values
function offsetValidator(me, boxType) {
  if (isNaN(new Number(me.text))) {
    alert(
      "Please use a number in the " + boxType + " offset box!",
      "Invalid Offset Error"
    );
    me.text = "0";
  }
}

// On dialog close Validator
function ondLogClosed() {
  if (noPDFError && Number(dLog.startPG.text) > Number(dLog.endPG.text)) {
    alert(
      "Start Page must be less than or equal to the End Page.",
      "Invalid Page Number Error"
    );
    return false;
  }
}

// File filter for the mac to only show indy and pdf files
// The test for the constructor name came from Dave Suanders: http://jsid.blogspot.com/2006_03_01_archive.html
function macFileFilter(fileToTest) {
  if (
    (fileToTest.name.indexOf(".pdf") != -1 ||
      fileToTest.name.indexOf(".indd") != -1 ||
      fileToTest.constructor.name == "Folder" ||
      fileToTest.name == "") &&
    fileToTest.name.indexOf(".app") == -1
  )
    return true;
  else return false;
}

// When reverseOrder checkbox is clicked, enable/disable the mapping checkbox
function reverseClicked() {
  var setValue = true;

  if (dLog.reverseOrder.value) {
    setValue = false;
  }

  dLog.mapPages.enabled = setValue && docPgCount != 1;
}
/*********************************************/
/*                                                                       */
/*        MAPPING SECTION                          */
/*                                                                       */
/********************************************/

// Create the mapping dialog box
function createMappingDialog(pdfStart, pdfEnd, numArray) {
  var maxCellsInRow = 8;
  var numDone = 0;
  var currentPage = pdfStart;
  var numPDFPages = pdfEnd - pdfStart + 1;
  var temp;

  mapDlog = new Window("dialog", "Map Pages");
  mapDlog.add(
    "statictext",
    [10, 15, 380, 35],
    "Map " +
      placementINFO.kind +
      " pages to desired Document pages (" +
      placementINFO.kind +
      "->Doc):"
  );

  // Dynamically create controls
  while (numDone < numPDFPages) {
    numCells = 0;
    while (numCells < maxCellsInRow && numDone < numPDFPages) {
      addW = numCells * 100;
      addH = Math.floor(numDone / maxCellsInRow) * 30;
      mapDlog.add(
        "statictext",
        [10 + addW, 45 + addH, 45 + addW, 65 + addH],
        formatPgNum(currentPage)
      );
      temp = mapDlog.add(
        "dropdownlist",
        [50 + addW, 40 + addH, 100 + addW, 60 + addH],
        null,
        { items: numArray }
      );
      temp.selection = ddIndexArray[currentPage % docPgCount];
      ddArray[currentPage % docPgCount] = temp;
      numCells++;
      numDone++;
      currentPage++;
    }
  }

  // Resize dialog window according to the number of cells
  if (numPDFPages < 4) mapDlogW = 400;
  else if (numPDFPages < maxCellsInRow) mapDlogW = 10 + numPDFPages * 100;
  else mapDlogW = 10 + maxCellsInRow * 100;

  mapDlogH = Math.ceil(numPDFPages / maxCellsInRow) * 30 + 80;

  // The buttons: uses the calculated height and width to determine position
  mapDlog.OKbut = mapDlog.add(
    "button",
    [mapDlogW - 140, mapDlogH - 35, mapDlogW - 80, mapDlogH - 10],
    "OK"
  );
  mapDlog.OKbut.onClick = onMapOKclicked;
  mapDlog.CANbut = mapDlog.add(
    "button",
    [mapDlogW - 70, mapDlogH - 35, mapDlogW - 10, mapDlogH - 10],
    "Cancel"
  );
  mapDlog.CANbut.onClick = onMapCANclicked;
  mapDlog.onClose = onMapClose;

  mapDlog.bounds = [0, 0, mapDlogW, mapDlogH];
  return mapDlog;
}

function onMapOKclicked() {
  mapDlog.close();
}

function onMapCANclicked() {
  doMapCheck = false;
  restoreDefaults(false);
  exit();
}

// Test the given input for duplicates.
function onMapClose() {
  var result = true;

  if (doMapCheck) {
    var trackerArray = new Array(docPgCount);

    // Xref the ddIndexArray to the ddArray selected index
    for (i = startPG; i <= endPG; i++) {
      var thisPop = ddArray[i % docPgCount];
      var popSelect = thisPop.selection.index;
      if (popSelect != 0) {
        if (trackerArray[popSelect]) {
          result = false;
          thisPop.graphics.backgroundColor = thisPop.graphics.newBrush(
            thisPop.graphics.BrushType.SOLID_COLOR,
            [1, 0, 0]
          );
        } else {
          trackerArray[popSelect] = true;
          thisPop.graphics.backgroundColor = thisPop.graphics.newBrush(
            thisPop.graphics.BrushType.SOLID_COLOR,
            [1, 1, 1]
          );
        }
      }
      ddIndexArray[i % docPgCount] = popSelect;
    }

    if (!result)
      alert(
        "A duplicate page was entered. Please make sure all drop downs have a unique selection.",
        "Duplicate Mapping Error"
      );
  }

  return result;
}

// Format the given page number to include an "arrow" so as to make
// the page number 5 characters long. Used in the mapping dialog box.
function formatPgNum(current) {
  if (current < 10) arrow = "--->";
  else if (current < 100) arrow = "-->";
  else arrow = "->";

  return current + arrow;
}

// Validate that selected PDF page range can all be mapped to separate pages
function mapPGValidator() {
  if (dLog.mapPages.value) {
    if (Number(dLog.endPG.text) - Number(dLog.startPG.text) + 1 > docPgCount) {
      alert(
        "Mapping is not available: There are not enough document pages to place the PDFs in the selected page range " +
          "onto their own document pages. Either reduce the number of PDF pages in the range or increase the " +
          "number of pages in the document that the PDF pages are being placed into.",
        "Mapping Error"
      );
      dLog.mapPages.value = false;
    } else {
      dLog.reverseOrder.enabled = false;
    }
  } else {
    // Unchecked, enable reverseOrder checkbox
    dLog.reverseOrder.enabled = true;
  }
}
