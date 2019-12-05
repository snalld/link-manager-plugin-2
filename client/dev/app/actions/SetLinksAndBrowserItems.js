import * as R from "ramda";

import { browserItemsFromLinks } from "../helpers/browserItemsFromLinks";

const browserItemPropLens = (prop, id) =>
  R.lensPath(["browserItems", id, prop]);

export const SetBrowserItems = (state, browserItems) => ({
  ...state,
  browserItems
});

export const SetLinks = (state, links) => ({
  ...state,
  links
});

export const SetBrowserItemError = (state, { id, value }) => {
  const newState = R.set(browserItemPropLens("isError", id), value, state);
  return newState;
};

export const SetBrowserItemCollapsed = (state, { id, value }) => {
  const newState = R.set(browserItemPropLens("isCollapsed", id), value, state);
  return newState;
};

import * as L from "partial.lenses";

const allInstancesOfID = id =>
  L.compose(
    L.prop("browserItems"),
    L.values,
    L.prop("linkIDs"),
    L.find(R.equals(id))
  );

export const ReplaceBrowserItemLinkID = (state, { from, to }) =>
  L.set(allInstancesOfID(from), to, state);

export const SetBrowserItemPageNumber = (state, { id, value }) => {
  const newState = R.set(browserItemPropLens("pageNumber", id), value, state);
  return newState;
};

export const SetLinksAndBrowserItems = (state, links) => {
  const browserItems = browserItemsFromLinks(links);
  return SetBrowserItems(SetLinks(state, links), browserItems);
};
