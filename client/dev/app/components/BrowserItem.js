import * as R from "ramda";
import { h } from "hyperapp";

import { WidthSpacer } from "./WidthSpacer";

const CollapseArrow = ({ isCollapsed, isHidden }) => (
  <div style={{ display: "flex" }}>
    {!isHidden ? (!isCollapsed ? "↓" : "→") : null}
  </div>
);

export const BrowserItem = ({
  item,
  collapsible,
  isCollapsed,
  isError,
  isSelected,
  Columns = []
}) =>
  !isCollapsed && (
    <div
      key={item.key}
      style={{
        backgroundColor: isSelected ? "lightgrey" : ""
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "16px auto 1fr 16px 16px",
          gridTemplateRows: "16px",
          justifyItems: "start",
          color: isError ? "red" : "black"
        }}
      >
        <CollapseArrow isHidden={!collapsible} />
        <WidthSpacer depth={item.indent} width={16} />
        {/* <span>{item.label}</span> */}
        {R.map(
          column => (
            <div style={{ overflow: "hidden" }}>
              {column}
            </div>
          ),
          Columns
        )}
        {/* <span style={{ paddingLeft: 10, color: error ? "red" : "black" }}>
        {R.prop("page", getByID(item.sortKeys.id, state.links) || {})}
      </span> */}
      </div>
    </div>
  );
