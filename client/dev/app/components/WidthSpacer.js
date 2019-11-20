import { h } from "hyperapp";
import * as R from "ramda";

export const WidthSpacer = ({ depth }) => (
  <span style={{ display: "inline-flex" }}>
    {R.repeat(<span style={{ width: 20 }}>-</span>, depth)}
  </span>
);
