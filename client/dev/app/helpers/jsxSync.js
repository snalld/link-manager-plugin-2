const { readFileSync } = eval('require("fs")');
import { dirname, resolve } from "path";
// import { promisify } from "util";
// const access = promisify(fs.access);

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

const readJSXSync = (filepathRelative, root) => {
  const filepathAbsolute = !root
    ? resolveJSXFile(filepathRelative)
    : resolveJSXInclude(root, filepathRelative);

  const script = readFileSync(filepathAbsolute, "utf8")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\/+@include \\"(.+)\\"/, (_, includePath) =>
      readJSXSync(includePath, dirname(filepathAbsolute)).replace(/\s+var main = \w+/, "")
    );

  return script;
};

export const runJSXSync = (filepathRelative, callback = () => {}, args = []) => {
  var script = readJSXSync(filepathRelative);
  var jsonScript = readJSXSync("./vendor/json2.js");

  if (!script) console.error(`Empty file: ${filepathRelative}`);
  // console.log(script);

  const isBin = script.substring(0, 10) === "@JSXBIN@ES" ? "" : "\n";
  const argString = JSON.stringify(args);

  let wrappedScript = `
$.level = 0;
try{eval('''${isBin}// need to add an extra line otherwise #targetengine doesn't work ;-]
${jsonScript};
${script};
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
        callback(JSON.parse(res));
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
