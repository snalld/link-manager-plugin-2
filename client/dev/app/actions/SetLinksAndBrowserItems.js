import * as R from "ramda";

import { browserItemsFromLinks } from "../helpers/browserItemsFromLinks";

export const SetBrowserItems = (state, browserItems) => ({
  ...state,
  browserItems
})

export const SetLinks = (state, links) => ({
  ...state,
  links
})

// const SetBrowserItemPropByID = (state, prop, id) => {

// }

const browserItemPropLens = (prop, id) =>
  R.lensPath(["browserItems", id, prop]);

export const SetBrowserItemError = (state, isError, id) => {
  const newState = R.set(browserItemPropLens("error", id), isError, state);
  return newState;
};

export const SetLinksAndBrowserItems = (state, links) => {
  const browserItems = browserItemsFromLinks(links)
  return SetBrowserItems(SetLinks(state, links), browserItems)
}
