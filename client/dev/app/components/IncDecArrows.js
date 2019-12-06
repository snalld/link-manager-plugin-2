import { h } from "hyperapp";

import { __ } from "../actions/General";

export const IncDecArrows = ({
  Increment = __,
  Decrement = __,
  canIncrement = true,
  canDecrement = true
}) => (
  <div
    style={{
      display: "block",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      width: 12,
      height: 16
    }}
  >
    <div style={{ height: 8, textAlign: "center", cursor: "pointer" }} onClick={Increment}>
      <div style={{ marginTop: -4.5, pointerEvents: "none" }}>∧</div>
    </div>
    <div style={{ height: 8, textAlign: "center", cursor: "pointer" }} onClick={Decrement}>
      <div style={{ marginTop: -5, pointerEvents: "none" }}>∨</div>
    </div>
  </div>
);
