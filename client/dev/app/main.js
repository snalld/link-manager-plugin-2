import { app } from "hyperapp";
import CSInterface from "../vendor/CSInterface"; // I had to manually add export line to vendor file :(

import * as R from "ramda";

import { view } from "./view";

import { createCEPEventSubscription } from "./helpers/cepEventSubscription";

const csInterface = new CSInterface();

const onSelectionChanged = createCEPEventSubscription(
  csInterface,
  "afterSelectionChanged"
);

const onDocumentActivate = createCEPEventSubscription(
  csInterface,
  "documentAfterActivate"
);

import { InitPanelData } from "./actions/InitPanelData";
import { SetSelectedLinkIDs } from "./actions/SetSelectedLinkIDs";
import { SetActiveDocument } from "./actions/SetActiveDocument";
import { SetBrowserItemPageNumber } from "./actions/SetLinksAndBrowserItems";
import { ReplaceLinkIDForAllBrowserItem } from "./actions/SetLinksAndBrowserItems";
import { JSX } from "./effects/JSX";

import { pipeActions } from "./helpers/pipeActions";

// runJSX("getPDFInfo.jsx", res => console.log(res))

const getByID = (id, object) => R.find(R.propEq("id", id), object);
const getByProp = (prop, id, object) => R.find(R.propEq(prop, id), object);

app({
  init: [
    {
      hostEventListeners: {},
      activeDocument: {},
      links: [],
      selectedLinkIDs: []
    },
    JSX({
      action: SetActiveDocument,
      filename: "getActiveDocument.jsx"
    }),
    JSX({
      action: (state, activeDocument) =>
        activeDocument.url === state.activeDocument.url
          ? [
              state,
              JSX({
                action: InitPanelData,
                filename: "getLinks.jsx"
              })
            ]
          : state,
      filename: "getActiveDocument.jsx"
    }),
    JSX({
      action: SetSelectedLinkIDs,
      filename: "getSelectedLinkIDs.jsx"
    })
  ],

  view,

  subscriptions: state => [
    onSelectionChanged([
      state,
      JSX({
        action: (state, activeDocument) =>
          activeDocument.url === state.activeDocument.url
            ? [
                state,
                JSX({
                  action: SetSelectedLinkIDs,
                  filename: "getSelectedLinkIDs.jsx"
                })
              ]
            : state,
        filename: "getActiveDocument.jsx"
      })
    ]),

    onDocumentActivate(state => [
      state,
      JSX({
        action: SetActiveDocument,
        filename: "getActiveDocument.jsx"
      }),
      JSX({
        action: (state, activeDocument) =>
          activeDocument.url === state.activeDocument.url
            ? [
                state,
                JSX({
                  action: InitPanelData,
                  filename: "getLinks.jsx"
                })
              ]
            : state,
        filename: "getActiveDocument.jsx"
      }),
      JSX({
        action: (state, activeDocument) =>
          activeDocument.url === state.activeDocument.url
            ? [
                state,
                JSX({
                  action: SetSelectedLinkIDs,
                  filename: "getSelectedLinkIDs.jsx"
                })
              ]
            : state,
        filename: "getActiveDocument.jsx"
      })
    ])
  ],

  node: document.querySelector("#app")
});
