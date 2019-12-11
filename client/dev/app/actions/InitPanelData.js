import * as R from "ramda";

import { SetLinksAndBrowserItems } from "./SetLinksAndBrowserItems";
import { SetBrowserItemError } from "./SetLinksAndBrowserItems";
import { Exists } from "../effects/FS";

export const InitPanelData = (state, links) => {
  const newState = SetLinksAndBrowserItems(state, links);

  const effects = R.compose(
    R.map(browserItem =>
      Exists({
        action: (state, doesExist) =>
          SetBrowserItemError(state, {
            value: !doesExist,
            id: browserItem.id
          }),
        path: `/Volumes/${browserItem.path}`
      })
    ),
    R.values
  )(newState.browserItems);

  return [newState, ...effects];
};
