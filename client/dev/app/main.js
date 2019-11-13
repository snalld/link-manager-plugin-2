import * as R from "ramda";

import { app, h } from "hyperapp";

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

const WidthSpacer = ({ depth }) => (
  <span style={{ display: "inline-flex" }}>
    {R.repeat(<span style={{ width: 20 }}>-</span>, depth)}
  </span>
);

app({
  init: [
    {
      document: "",
      links: []
    }
  ],

  view: state => (
    <main>
      {R.map(
        browserItem => (
          <div>
            <p>
              <WidthSpacer depth={browserItem.indent} />
              <span>{browserItem.label}</span>
            </p>
          </div>
        ),
        R.sortWith([
          R.ascend(R.path(["sortKeys", "path"])),
          R.ascend(R.prop("indent")),
          R.descend(R.path(["sortKeys", "parentPage"])),
          // R.ascend(R.path(["sortKeys", "page"])),
        ])(state.browserItems || [])
      )}
    </main>
  ),

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
