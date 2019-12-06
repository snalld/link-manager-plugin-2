import * as R from "ramda";

import { app, h } from "hyperapp";

import CSInterface from "../vendor/CSInterface"; // I had to manually add export line to vendor file :(

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

import { InitPanelData } from "./actions/InitPanelData";
import { SetSelectedLinkIDs } from "./actions/SetSelectedLinkIDs";
import { SetActiveDocument } from "./actions/SetActiveDocument";
import { SetBrowserItemPageNumber } from "./actions/SetLinksAndBrowserItems";
import { ReplaceLinkIDForAllBrowserItem } from "./actions/SetLinksAndBrowserItems";
import { JSX } from "./effects/JSX";

import { BrowserItem } from "./components/BrowserItem";
import { runJSX } from "./helpers/jsx";
import { If } from "./components/Logic";
import { pipeActions } from "./helpers/pipeActions";
import { IncDecArrows } from "./components/IncDecArrows";

// runJSX("getPDFInfo.jsx", res => console.log(res))

const getByID = (id, object) => R.find(R.propEq("id", id), object);
const getByProp = (prop, id, object) => R.find(R.propEq(prop, id), object);

const ChangeBrowserItemPageNumber = (state, { pageNumber, browserItem }) => [
  state,
  JSX({
    action: (state, { id, pageNumber }) =>
      pipeActions(state, [
        {
          action: SetBrowserItemPageNumber,
          args: { id: browserItem.key, value: pageNumber }
        },
        {
          action: ReplaceLinkIDForAllBrowserItem,
          args: { from: browserItem.linkIDs[0], to: id }
        }
      ]),
    filename: "changePlacedLinkPage.jsx",
    args: [pageNumber, browserItem.linkIDs[0]]
  })
];

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

  view: state => (
    <main>
      {console.log(state)}

      {R.addIndex(R.map)((browserItem, idx, src) => {
        // if (idx == 0) runJSX("getPDFInfo.jsx", (res) => console.log(res), [state.links[0].path])

        let indent = 0;
        let effectivePPI;
        let collapsible = true;

        let isCollapsed = false;
        let isHidden = false;
        let isSelected = false;

        let isSingleGroup = false;

        if (browserItem.type === "group") {
          isSingleGroup = browserItem.linkIDs.length === 1;
          if (isSingleGroup) isHidden = true;
        }

        let isOnlyFileInGroup = false;

        if (browserItem.type === "file") {
          isSelected =
            browserItem.linkIDs.length === 1 &&
            R.contains(browserItem.linkIDs[0], state.selectedLinkIDs);

          isOnlyFileInGroup =
            browserItem.type === "file" &&
            idx - 1 ===
              walkParentTreeUntil(
                parent =>
                  parent.type === "group" && parent.linkIDs.length === 1,
                idx,
                src
              );
        }

        if (isOnlyFileInGroup) indent = browserItem.indent - 1;

        if (browserItem.type === "file" || isSingleGroup) {
          collapsible = false;
        }

        return (
          <BrowserItem
            item={browserItem}
            indent={indent || browserItem.indent}
            collapsible={collapsible}
            isCollapsed={browserItem.isCollapsed || isCollapsed}
            isHidden={
              browserItem.isHidden ||
              isHidden ||
              !!walkParentTreeUntil(
                parent => !parent || parent.isCollapsed === true,
                idx,
                src
              )
            }
            isError={browserItem.isError}
            isSelected={isSelected}
            Columns={[
              <div>{browserItem.label}</div>,
              <If condition={browserItem.pageNumber}>
                <IncDecArrows
                  Increment={[
                    ChangeBrowserItemPageNumber,
                    {
                      pageNumber: browserItem.pageNumber + 1,
                      browserItem: browserItem
                    }
                  ]}
                  Decrement={[
                    ChangeBrowserItemPageNumber,
                    {
                      pageNumber: browserItem.pageNumber - 1,
                      browserItem: browserItem
                    }
                  ]}
                ></IncDecArrows>
                <div style={{ display: "block" }}>{browserItem.pageNumber}</div>
              </If>,
              <div>{browserItem.parentPageNumber}</div>,
              <div>{effectivePPI}</div>
            ]}
          ></BrowserItem>
        );
      }, R.sortWith([R.ascend(R.prop("key"))])(R.values(state.browserItems) || []))}
    </main>
  ),

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
