import R from "ramda";

import { app } from "hyperapp";

import CSInterface from "../vendor/CSInterface"; // I had to manually add export line to vendor file :(

import { runJSX } from "./helpers/jsx";
import { dispatchEvent } from "./helpers/dispatchEvent";
import { createCEPEventSubscription } from "./helpers/cepEventSubscription";

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

const SetLinks = (state, links) => {
  console.log("SetLinks", {
    ...state,
    links
  });

  return {
    ...state,
    links
  };
};

const SetDocument = (state, document) => {
  console.log("SetDocument", {
    ...state,
    document
  });
  return { ...state, document };
};

const asyncSubscriptionHandler = fn => state => [state, (() => [fn])()];

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
          )
        } else {
          // changed selection within same doc
        }
      })
    ),
    onLinksUpdate(SetLinks)
  ],

  node: document.querySelector("#app")
});

runJSX("getLinks.jsx", res =>
  dispatchEventWithCSInterface("com.linkmanager2.updatedLinks", res)
);

// state => {
//   const document = await new Promise((resolve, reject) => runJSX("getActiveDoc.jsx", resolve))

//   console.log(document, state.document)
//   // if (document != state.document) {
//   //   console.log("switched")
//   // }

//   return {
//     ...state,
//     document
//   };
// }
