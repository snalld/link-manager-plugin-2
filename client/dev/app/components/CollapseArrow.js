import { h } from "hyperapp";

import { __ } from "../actions/General";

export const setValue = (value, [action, props]) => [
  action,
  { ...props, value }
];

export const CollapseArrow = ({
  isCollapsed = false,
  isHidden = false,
  OnClick = __
}) => (
  <div style={{ display: "flex" }}>
    {!isHidden ? (
      !isCollapsed ? (
        <p style={{ margin: 0 }} onclick={setValue(true, OnClick)}>
          ↓
        </p>
      ) : (
        <p style={{ margin: 0 }} onclick={setValue(false, OnClick)}>
          →
        </p>
      )
    ) : null}
  </div>
);
