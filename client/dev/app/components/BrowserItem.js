import { h } from "hyperapp";
import * as R from "ramda";

import { SetBrowserItemCollapsed } from "../actions/SetLinksAndBrowserItems";

import { WidthSpacer } from "./WidthSpacer";

import { CollapseArrow } from "./CollapseArrow";

export const BrowserItem = ({
  item,
  indent,
  collapsible,
  isCollapsed,
  isError,
  isHidden,
  isSelected,
  Columns = []
}) =>
  !isHidden && (
    <div
      key={item.key}
      style={{
        backgroundColor: isSelected ? "lightgrey" : ""
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "16px auto 1fr 48px 16px",
          gridTemplateRows: "16px",
          justifyItems: "stretch",
          color: isError ? "red" : "black"
        }}
      >
        <CollapseArrow
          isHidden={!collapsible}
          isCollapsed={isCollapsed}
          OnClick={[SetBrowserItemCollapsed, { id: item.key }]}
        />
        <WidthSpacer depth={indent} width={16} />
        {R.map(
          column => (
            <div
              style={{
                overflow: "hidden"
              }}
            >
              {column}
            </div>
          ),
          R.slice(0, 1, Columns)
        )}
        {R.map(
          column => (
            <div style={{ display: "flex" }}>{column}</div>
          ),
          R.tail(Columns)
        )}
        {/* <span style={{ paddingLeft: 10, color: error ? "red" : "black" }}>
        {R.prop("page", getByID(item.sortKeys.id, state.links) || {})}
      </span> */}
      </div>
    </div>
  );
