import { runJSX } from "../helpers/jsx";

const effect = (dispatch, {action, filename, args, callback, useIndesignHistory}) => {
    console.log(filename)
    return runJSX(filename, callback, args, useIndesignHistory).then(data => dispatch(action, data))
}

export const JSX = props => {
    return [effect, props]
}