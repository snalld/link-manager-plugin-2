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

export const SetBrowserItemPageNumber = (state, { id, value }) =>
  L.set(["browserItems", id, "pageNumber"], value, state);

export const SetLinksAndBrowserItems = (state, links) => {
  const browserItems = browserItemsFromLinks(links);
  return SetBrowserItems(SetLinks(state, links), browserItems);
};


const lensAllInstancesOfID = id =>
  L.compose(
    L.prop("browserItems"),
    L.values,
    L.prop("linkIDs"),
    L.find(R.equals(id)),
    L.optional
  );

export const ReplaceLinkIDForAllBrowserItem = (state, { from, to }) =>
  L.modify(lensAllInstancesOfID(from), (from) => {console.log("from to",from, to); return to}, state);
