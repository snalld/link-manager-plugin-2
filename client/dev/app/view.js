import { h } from "hyperapp";

import * as R from "ramda";
import { walkParentTreeUntil } from "./helpers/browser/walkParentTreeUntil";

import { BrowserItem } from "./components/BrowserItem";
import { If } from "./components/Logic";
import { IncDecArrows } from "./components/IncDecArrows";
import { index } from "partial.lenses";

const ChangeBrowserItemPageNumber = (state, { pageNumber, browserItem }) => [
  state,
  JSX({
    action: (state, { id, pageNumber }) =>
      pipeActions(state, [
        {
          action: SetBrowserItemPageNumber,
          args: { id: browserItem.id, value: pageNumber }
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

export const view = state => (
  <main>
    {console.log(state)}

    {R.addIndex(R.map)((browserItem, idx, src) => {
      const nextBrowserItem = src[idx + 1];
      const nextNextBrowserItem = src[idx + 2];
      const prevBrowserItem = src[idx - 1];

      let indent = 0;
      let effectivePPI;
      let collapsible = true;
      let isCollapsed = false;
      let isHidden = false;
      let isSelected = false;
      let isSingleGroup = false;

      if (browserItem.type === "group") {
        isSingleGroup = !!nextBrowserItem && !!nextNextBrowserItem && nextBrowserItem.path !== nextNextBrowserItem.path
        if (isSingleGroup) isHidden = true;
      }

      let isOnlyFileInGroup = false;

      if (browserItem.type === "file") {
        isSelected =
          browserItem.linkIDs.length === 1 &&
          R.contains(browserItem.linkIDs[0], state.selectedLinkIDs);

        isOnlyFileInGroup =
          !!nextBrowserItem &&
          browserItem.type === "file" &&
          prevBrowserItem.type === "group" &&
          nextBrowserItem.indent !== browserItem.indent;
      }

      if (isOnlyFileInGroup) indent = browserItem.indent - 1;

      if (
        browserItem.type === "file"
        // || isSingleGroup
      ) {
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
    }, R.sortWith([R.ascend(R.prop("id"))])(R.values(state.browserItems) || []))}
  </main>
);
