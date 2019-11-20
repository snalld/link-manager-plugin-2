import { runJSX } from "../helpers/jsx";

const effect = (
  dispatch,
  {
    action,
    filename,
    args,
    callback,
    useIndesignHistory,
    transposer = data => data
  }
) => {
  console.log("Running: ", filename);
  return new Promise(resolve => runJSX(filename, resolve, args, useIndesignHistory)).then(data =>
    dispatch(action, transposer(data))
  );
};

export const JSX = props => {
  return [effect, props];
};
