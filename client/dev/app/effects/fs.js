const fs = require("fs");
import { promisify } from "util";
const access = promisify(fs.access);

export const Exists = options => [
  (dispatch, options) =>
    new Promise(resolve =>
      fs.access(options.path, fs.constants.F_OK, error => resolve(error))
    ).then(error => dispatch(options.action, !error)),
  options
];