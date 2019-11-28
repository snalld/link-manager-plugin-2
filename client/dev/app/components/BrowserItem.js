import { h } from "hyperapp";

import { WidthSpacer } from "./WidthSpacer";

export const BrowserItem = ({
  item,
  isCollapsed,
  isError,
  isSelected,
  ControlPanelLabel = () => {}
}) => (
  !isCollapsed && <div key={item.key} style={{ backgroundColor: isSelected ? "lightgrey" : "" }}>
    {console.log(isSelected)}
    <p style={{ color: isError ? "red" : "black" }}>
      <WidthSpacer depth={item.indent} />
      <span>{item.label}</span>
      <span>
        <ControlPanelLabel></ControlPanelLabel>
      </span>
      {/* <span style={{ paddingLeft: 10, color: error ? "red" : "black" }}>
        {R.prop("page", getByID(item.sortKeys.id, state.links) || {})}
      </span> */}
    </p>
  </div>
);
