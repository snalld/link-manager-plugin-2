import * as R from "ramda";

import { SetLinksAndBrowserItems } from "./SetLinksAndBrowserItems";
import { SetBrowserItemError } from "./SetLinksAndBrowserItems";
import { Exists } from "../effects/fs";

export const InitPanelData = (state, links) => {
  const newState = SetLinksAndBrowserItems(state, links);
  const effects = R.values(newState.browserItems).map(browserItem =>
    Exists({
      action: (state, isError) =>
        SetBrowserItemError(state, isError, browserItem.key),
      path: `/Volumes/${browserItem.path}`
    })
  );
  return [newState, ...effects];
};
