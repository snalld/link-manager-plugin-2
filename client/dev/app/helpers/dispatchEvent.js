import { CSEvent } from "../../vendor/CSInterface";

export const dispatchEvent = (csInterface, type, data) => {
  var event = new CSEvent(type, "APPLICATION");
  event.data = data;
  csInterface.dispatchEvent(event);
};
