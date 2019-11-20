import { promisify } from "util";

const fs = eval('require("fs")');
const readFile = promisify(fs.readFile);

import { dirname, resolve } from "path";

import * as R from "ramda";

const EXTENSION_LOCATION = (() => {
  const extensionPath = decodeURI(
    window.__adobe_cep__.getSystemPath("extension")
  );
  const isMac = navigator.platform[0] === "M"; // [M]ac
  return extensionPath.replace("file://" + (isMac ? "" : "/"), "");
})();

// add relative to previous file instead of root
const resolveJSXFile = filepathRelative =>
  resolve(EXTENSION_LOCATION, "jsx/", filepathRelative);

const resolveJSXInclude = (root, filepathRelative) =>
  resolve(root, filepathRelative);

const readJSX = async (filepathRelative, root) => {
  const filepathAbsolute = !root
    ? resolveJSXFile(filepathRelative)
    : resolveJSXInclude(root, filepathRelative);

  const script = await readFile(filepathAbsolute, "utf8");

  const includeStrings = script.match(/\/\/@include +\"(.+)\"/g) || [];
  const includePaths = includeStrings.map(
    includeString => includeString.match(/"(.+)"/)[1]
  );

  const includes = includePaths.map(includePath =>
    readJSX(includePath, dirname(filepathAbsolute))
  );

  return {
    path: filepathAbsolute,
    script,
    includes: await Promise.all(includes)
  };
};

const flattenIncludes = ({ path, script, includes }) => {
  return [
    ...includes.map(include => flattenIncludes(include)[0]),
    { path, script }
  ];
};

export const runJSX = async (
  filepathRelative,
  callback = data => data,
  args = []
) => {
  var jsonScript = await readJSX("./vendor/json2.js");
  var script = await readJSX(filepathRelative);

  const createScript = scriptStack =>
    R.join(
      "",
      R.map(
        R.prop("script"),
        R.uniqBy(R.prop("path"), flattenIncludes(scriptStack))
      )
    )
      .replace(/\/+@include \"(.+)\"/, "")
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"');

  // const isBin = script.substring(0, 10) === "@JSXBIN@ES" ? "" : "\n";
  const isBin = false;
  const argString = JSON.stringify(args);

  let wrappedScript = `
$.level = 0;
try{eval('''${isBin}// need to add an extra line otherwise #targetengine doesn't work ;-]
${createScript(jsonScript)};
${createScript(script)};
(function () { return JSON.stringify(main.apply(null,${argString})) })();
''') + '';
} catch (e) {
  (function(e) {
    var line, sourceLine, name, description, ErrorMessage, fileName, start, end, bug;
    
    line = +e.line${isBin === "" ? "" : " - 1 "};
    fileName = File(e.fileName).fsName;

    sourceLine = line && e.source.split(/[\\r\\n]/)[line];
    name = e.name;
    description = e.description;
    ErrorMessage = name + ' ' + e.number + ': ' + description;

    if (fileName.length && !(/[\\/\\\\]\\d+$/.test(fileName))) {
      ErrorMessage += '\\nFile: ' + fileName;
      line++;
    }

    if (line){
      ErrorMessage += '\\nLine ' + line +
      ':' + ((sourceLine.length < 300) ? sourceLine : sourceLine.substring(0,300) + '...');
    }

    if (e.start) {
      ErrorMessage += '\\nBug: ' + e.source.substring(e.start - 1, e.end)
    }

    if ($.includeStack) {
      ErrorMessage += '\\nStack:' + $.stack;
    }
    
    return ErrorMessage;
  })(e);
}
`;

  try {
    window.__adobe_cep__.evalScript(wrappedScript, res => {
      try {
        const data = JSON.parse(res).data;
        callback(data);
      } catch (error) {
        console.error(res);
      }
    });
  } catch (err) {
    var newErr;
    newErr = new Error(err);
    console.error("Error Eek: " + newErr.stack);
  }
};
