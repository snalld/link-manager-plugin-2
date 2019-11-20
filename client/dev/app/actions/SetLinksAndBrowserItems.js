import { browserItemsFromLinks } from "../helpers/browserItemsFromLinks";

export const SetLinksAndBrowserItems = (state, links) => ({
  ...state,
  links,
  browserItems: browserItemsFromLinks(links)
});
