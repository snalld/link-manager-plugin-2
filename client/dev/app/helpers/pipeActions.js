import * as R from "ramda";

export const pipeActions = (state, actions) =>
  R.reduce(
    (nextState, { action, args }) => action(nextState, args),
    state,
    actions
  );
