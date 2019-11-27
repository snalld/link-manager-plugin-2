import * as R from "ramda";

import { app, h } from "hyperapp";

import CSInterface from "../vendor/CSInterface"; // I had to manually add export line to vendor file :(

import { runJSX } from "./helpers/jsx";
import { dispatchEvent } from "./helpers/dispatchEvent";
import { createCEPEventSubscription } from "./helpers/cepEventSubscription";
// import { asyncSubscriptionHandler } from "./helpers/asyncSubscriptionHandler";
// import { browserItemsFromLinks } from "./helpers/browserItemsFromLinks";

const csInterface = new CSInterface();

const onSelectionChanged = createCEPEventSubscription(
  csInterface,
  "afterSelectionChanged"
);

const onDocumentActivate = createCEPEventSubscription(
  csInterface,
  "documentAfterActivate"
);

const __ = state => state;

const fs = eval('require("fs")');
import { promisify } from "util";
const access = promisify(fs.access);

import { BrowserItem } from "./components/BrowserItem";

import { InitPanelData } from "./actions/InitPanelData";
import { SetSelectedLinkIDs } from "./actions/SetSelectedLinkIDs";
import { SetActiveDocument } from "./actions/SetActiveDocument";
import { JSX } from "./effects/jsx";

const getByID = (id, links) => R.find(R.propEq("id", id), links);

app({
  init: [
    {
      hostEventListeners: {},
      activeDocument: {},
      links: [],
      selectedLinkIDs: []
    },
    JSX({
      action: InitPanelData,
      filename: "getLinks.jsx"
    }),
    JSX({
      action: SetActiveDocument,
      filename: "getActiveDocument.jsx"
    }),
  ],

  view: state => (
    <main>
      {console.log(state)}

      {R.addIndex(R.map)(browserItem => {
        let exists = true;
        return <BrowserItem item={browserItem} error={!browserItem.error}></BrowserItem>;
      }, R.sortWith([R.ascend(R.prop("key"))])(R.values(state.browserItems) || []))}
    </main>
  ),

  subscriptions: state => [
    onSelectionChanged([
      state,
      JSX({
        action: SetSelectedLinkIDs,
        filename: "getSelectedLinkIDs.jsx"
      })
    ]),

    onDocumentActivate((state, data) => [
      SetActiveDocument(state, data),
      JSX({
        action: InitPanelData,
        filename: "getLinks.jsx"
      }),
      JSX({
        action: SetSelectedLinkIDs,
        filename: "getSelectedLinkIDs.jsx"
      })
    ])
  ],

  node: document.querySelector("#app")
});
