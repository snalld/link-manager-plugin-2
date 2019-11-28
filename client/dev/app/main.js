import * as R from "ramda";

import { app, h } from "hyperapp";

import CSInterface from "../vendor/CSInterface"; // I had to manually add export line to vendor file :(

import { runJSX } from "./helpers/jsx";
import { dispatchEvent } from "./helpers/dispatchEvent";
import { createCEPEventSubscription } from "./helpers/cepEventSubscription";
import { walkParentTreeUntil } from "./helpers/browser/walkParentTreeUntil";

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
import { InitPanelData } from "./actions/InitPanelData";
import { SetSelectedLinkIDs } from "./actions/SetSelectedLinkIDs";
import { SetActiveDocument } from "./actions/SetActiveDocument";
import { JSX } from "./effects/jsx";

import { BrowserItem } from "./components/BrowserItem";

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
    JSX({
      action: SetSelectedLinkIDs,
      filename: "getSelectedLInkIDs.jsx"
    })
  ],

  view: state => (
    <main>
      {console.log(state)}

      {R.addIndex(R.map)((browserItem, idx, src) => {
        let collapsible = true;

        let isSelected =
          browserItem.linkIDs.length === 1 &&
          R.contains(browserItem.linkIDs[0], state.selectedLinkIDs);
        let isCollapsed = false;

        const isSingleGroup =
          browserItem.type === "group" && browserItem.linkIDs.length === 1;
        if (isSingleGroup) collapsible = false;

        const isOnlyFileInGroup =
          browserItem.type === "file" &&
          idx - 1 ===
            walkParentTreeUntil(
              parent => parent.type === "group" && parent.linkIDs.length === 1,
              idx,
              src
            );
        if (isOnlyFileInGroup) isCollapsed = true;

        return (
          <BrowserItem
            item={browserItem}
            collapsible={collapsible}
            isCollapsed={browserItem.isCollapsed || isCollapsed}
            isError={browserItem.isError}
            isSelected={isSelected}
        ControlPanelLabel={() => <span>{browserItem.pageNumber}</span>}
          ></BrowserItem>
        );
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
