import * as R from "ramda";

import { app } from "hyperapp";

import CSInterface from "../vendor/CSInterface"; // I had to manually add export line to vendor file :(

import { runJSX } from "./helpers/jsx";
import { dispatchEvent } from "./helpers/dispatchEvent";
import { createCEPEventSubscription } from "./helpers/cepEventSubscription";
import { browserItemsFromLinks } from "./helpers/browserItemsFromLinks";
import { asyncSubscriptionHandler } from "./helpers/asyncSubscriptionHandler";

const csInterface = new CSInterface();
const dispatchEventWithCSInterface = (type, data) =>
  dispatchEvent(csInterface, type, data);
const createCEPEventSubscriptionWithCSInterface = type =>
  createCEPEventSubscription(csInterface, type);

const onSelectionChanged = createCEPEventSubscriptionWithCSInterface(
  "afterSelectionChanged"
);

const onLinksUpdate = createCEPEventSubscriptionWithCSInterface(
  "com.linkmanager2.updatedLinks"
);

const onBrowserItemsUpdate = createCEPEventSubscriptionWithCSInterface(
  "com.linkmanager2.updatedBrowserItems"
);

const __ = state => state;


const SetLinksAndBrowserItems = (state, links) => {
  console.log("SetLinksAndBrowserItems", {
    ...state,
    links,
    browserItems: browserItemsFromLinks(links)
  });
  return {
    ...state,
    links,
    browserItems: browserItemsFromLinks(links)
  };
};

const SetDocument = (state, document) => {
  console.log("SetDocument", {
    ...state,
    document
  });
  return { ...state, document };
};

app({
  init: [
    {
      document: "",
      links: []
    }
  ],

  subscriptions: state => [
    onSelectionChanged(
      asyncSubscriptionHandler(async dispatch => {
        const document = await new Promise((resolve, reject) =>
          runJSX("getActiveDoc.jsx", resolve)
        );

        if (state.document !== document) {
          // changed document
          dispatch(SetDocument, document);

          runJSX("getLinks.jsx", res =>
            dispatchEventWithCSInterface("com.linkmanager2.updatedLinks", res)
          );
        } else {
          // changed selection within same doc
        }
      })
    ),
    onLinksUpdate(SetLinksAndBrowserItems)
  ],

  node: document.querySelector("#app")
});

runJSX("getLinks.jsx", res =>
  dispatchEventWithCSInterface("com.linkmanager2.updatedLinks", res)
);
