import { h } from "hyperapp";
import * as R from "ramda";

export const WidthSpacer = ({ depth, width }) => (
  <span style={{ display: "inline-flex" }}>
    {R.repeat(<span style={{ width }}></span>, depth)}
  </span>
);
