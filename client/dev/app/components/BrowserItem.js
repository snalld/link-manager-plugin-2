import * as R from "ramda";
import { h } from "hyperapp";

import { SetBrowserItemCollapsed } from "../actions/SetLinksAndBrowserItems";

import { WidthSpacer } from "./WidthSpacer";

const setValue = (value, [action, props]) => [
  action,
  { ...props, value }
];

const CollapseArrow = ({ isCollapsed, isHidden, OnClick }) => (
  <div style={{ display: "flex" }}>
    {!isHidden ? (
      !isCollapsed ? (
        <p style={{margin: 0}} onclick={setValue(true, OnClick)}>↓</p>
      ) : (
        <p style={{margin: 0}} onclick={setValue(false, OnClick)}>→</p>
      )
    ) : null}
  </div>
);

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
          gridTemplateColumns: "16px auto 1fr 16px 16px",
          gridTemplateRows: "16px",
          justifyItems: "start",
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
                overflow: "hidden",
                justifySelf: "start"
              }}
            >
              {column}
            </div>
          ),
          R.slice(0, 1, Columns)
        )}
        {R.map(
          column => (
            <div style={{ overflow: "hidden" }}>{column}</div>
          ),
          R.tail(Columns)
        )}
        {/* <span style={{ paddingLeft: 10, color: error ? "red" : "black" }}>
        {R.prop("page", getByID(item.sortKeys.id, state.links) || {})}
      </span> */}
      </div>
    </div>
  );
