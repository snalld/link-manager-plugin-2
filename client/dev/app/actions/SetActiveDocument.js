export const SetActiveDocument = (state, activeDocument) => {

  if (typeof activeDocument === "string") {
    const regexURL = /<url>(file:)(.+)<\/url>/;
    const urlRaw = (regexURL.exec(activeDocument) || [])[2];
    const path = decodeURI(urlRaw || "");

    const regexName = /<name>(.+)<\/name>/;
    const name = regexName.exec(activeDocument)[1];

    activeDocument = {
      name,
      path
    };
  }

  return {
    ...state,
    activeDocument
  };
};
