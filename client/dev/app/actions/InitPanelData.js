import * as R from "ramda";

import { SetLinksAndBrowserItems } from "./SetLinksAndBrowserItems";
import { SetBrowserItemError } from "./SetLinksAndBrowserItems";
import { Exists } from "../effects/fs";
import { JSX } from "../effects/jsx";

export const InitPanelData = (state, links) => [
  state,
  JSX({
    action: (state, document) => {
      const newState = SetLinksAndBrowserItems(state, links);

      const effects = R.compose(
        R.map(browserItem =>
          Exists({
            action: (state, isError) =>
              SetBrowserItemError(state, isError, browserItem.key),
            path: `/Volumes/${browserItem.path}`
          })
        ),
        R.values
      )(newState.browserItems);

      return document.url === state.activeDocument.url
        ? [newState, ...effects]
        : state;
    },
    filename: "getActiveDocument.jsx"
  })
];
