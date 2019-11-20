import { h } from "hyperapp";

import { WidthSpacer } from "./WidthSpacer";

export const BrowserItem = ({ item, error }) => (
  <div key={item.key}>
    <p>
      <WidthSpacer depth={item.indent} />
      <span style={{ color: error ? "red" : "black" }}>{item.label}</span>

      {/* <span style={{ paddingLeft: 10, color: error ? "red" : "black" }}>
        {R.prop("page", getByID(item.sortKeys.id, state.links) || {})}
      </span> */}
    </p>
  </div>
);
