import { runJSX } from "../helpers/jsx.js";

const effect = (dispatch, {action, filename, args, callback, useIndesignHistory}) => {
    return runJSX(filename, callback, args, useIndesignHistory).then(data => dispatch(action, data))
}

export const JSX = props => {
    return [effect, props]
}