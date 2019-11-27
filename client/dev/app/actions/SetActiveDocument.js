export const SetActiveDocument = (state, activeDocument) => {
  // const regexURL = /<url>(file:)(.+)<\/url>/;
  // const urlRaw = (regexURL.exec(data) || [])[2];
  // const url = decodeURI(urlRaw || "");

  // const regexName = /<name>(.+)<\/name>/;
  // const name = regexName.exec(data)[1];

  return {
    ...state,
    activeDocument
  };
};
