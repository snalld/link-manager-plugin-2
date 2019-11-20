import * as R from "ramda";

import { app, h } from "hyperapp";

import CSInterface from "../vendor/CSInterface"; // I had to manually add export line to vendor file :(

import { runJSX } from "./helpers/jsx";
import { dispatchEvent } from "./helpers/dispatchEvent";
import { createCEPEventSubscription } from "./helpers/cepEventSubscription";
import { asyncSubscriptionHandler } from "./helpers/asyncSubscriptionHandler";
import { browserItemsFromLinks } from "./helpers/browserItemsFromLinks";

const csInterface = new CSInterface();

const dispatchEventWithCSInterface = (type, data) =>
  dispatchEvent(csInterface, type, data);

const createCEPEventSubscriptionWithCSInterface = type =>
  createCEPEventSubscription(csInterface, type);

const onSelectionChanged = createCEPEventSubscriptionWithCSInterface(
  "afterSelectionChanged"
);

const onDocumentActivate = createCEPEventSubscriptionWithCSInterface(
  "documentAfterActivate"
);

const __ = state => state;

const fs = eval('require("fs")');
import { promisify } from "util";
const access = promisify(fs.access);

import { BrowserItem } from "./components/BrowserItem";

import { SetLinksAndBrowserItems } from "./actions/SetLinksAndBrowserItems";
import { SetActiveDocument } from "./actions/SetActiveDocument";
import { JSX } from "./effects/JSX";

const getByID = (id, links) => R.find(R.propEq("id", id), links);

const main = app({
  init: [
    {
      hostEventListeners: {},
      activeDocument: "",
      links: []
    },
    JSX({
      action: SetLinksAndBrowserItems,
      filename: "getLinks.jsx"
    })
  ],

  view: state => (
    <main>
      {console.log(state)}

      {R.addIndex(R.map)(browserItem => {
        let exists = true;
        if (browserItem.type !== "file") {
          try {
            fs.accessSync("/Volumes/" + browserItem.path, fs.constants.F_OK);
          } catch (error) {
            exists = false;
          }
        } else {
        }

        return <BrowserItem item={browserItem} error={!exists}></BrowserItem>;
      }, R.sortWith([R.ascend(R.prop("key"))])(state.browserItems || []))}
    </main>
  ),

  subscriptions: state => [
    // onSelectionChanged(
    //   asyncSubscriptionHandler(async dispatch => {
    //     console.log("change selection");
    //   const document = await new Promise((resolve, reject) =>
    //     runJSX("getActiveDoc.jsx", resolve)
    //   );
    //   console.log(document)

    //   if (state.document !== document) {
    //     // changed document
    //     dispatch(SetActiveDocument, document);

    //     runJSX("getLinks.jsx", res =>
    //       dispatchEventWithCSInterface("com.linkmanager2.updatedLinks", res)
    //     );
    //   } else {
    //     // changed selection within same doc
    //   }
    //   })
    // ),

    onDocumentActivate((state, data) => {
      const regexURL = /<url>(file:)(.+)<\/url>/;
      const urlRaw = (regexURL.exec(data) || [])[2];
      const url = decodeURI(urlRaw || "");

      const regexName = /<name>(.+)<\/name>/;
      const name = regexName.exec(data)[1];

      return SetActiveDocument(state, `${url}:${name}`);
    }),

    onDocumentActivate([
      state,
      JSX({
        action: SetLinksAndBrowserItems,
        filename: "getLinks.jsx"
      })
    ])
  ],

  node: document.querySelector("#app")
});

runJSX("getLinks.jsx", res =>
  dispatchEventWithCSInterface("com.linkmanager2.updatedLinks", res)
);
