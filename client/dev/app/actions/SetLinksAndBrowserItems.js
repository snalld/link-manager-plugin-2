import * as R from "ramda";
import * as L from "partial.lenses";

import { browserItemsFromLinks } from "../helpers/browserItemsFromLinks";

export const SetBrowserItems = (state, browserItems) => ({
  ...state,
  browserItems
});

export const SetLinks = (state, links) => ({
  ...state,
  links
});

export const SetBrowserItemError = (state, { id, value }) =>
  L.set(["browserItems", id, "isError"], value, state);

export const SetBrowserItemCollapsed = (state, { id, value }) =>
  L.set(["browserItems", id, "isCollapsed"], value, state);

const lensAllInstancesOfID = id =>
  L.compose(
    L.prop("browserItems"),
    L.values,
    L.prop("linkIDs"),
    L.find(R.equals(id))
  );

export const ReplaceBrowserItemLinkID = (state, { from, to }) =>
  L.set(lensAllInstancesOfID(from), to, state);

export const SetBrowserItemPageNumber = (state, { id, value }) =>
  L.set(["browserItems", id, "pageNumber"], value, state);

export const SetLinksAndBrowserItems = (state, links) => {
  const browserItems = browserItemsFromLinks(links);
  return SetBrowserItems(SetLinks(state, links), browserItems);
};
