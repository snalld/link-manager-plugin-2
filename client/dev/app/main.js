import R from 'ramda'

import { app } from "hyperapp";

import CSInterface from "../vendor/CSInterface" // I had to manually add export line to vendor file :(

import { runJSX } from "./helpers/jsx";
import { dispatchEvent } from "./helpers/dispatchEvent";
import { createCEPEventSubscription } from "./helpers/cepEventSubscription";

import JSX from './effects/JSX'

const csInterface = new CSInterface()
const dispatchEventWithCSInterface = (type, data) => dispatchEvent(csInterface, type, data)
const createCEPEventSubscriptionWithCSInterface = (type) => createCEPEventSubscription(csInterface, type)

const onSelectionChanged = createCEPEventSubscriptionWithCSInterface(
  "afterSelectionChanged"
);

const onLinksUpdate = createCEPEventSubscriptionWithCSInterface(
  "com.linkmanager2.updatedLinks"
);

const onBrowserItemsUpdate = createCEPEventSubscriptionWithCSInterface(
  "com.linkmanager2.updatedBrowserItems"
);

const __ = (state) => state

const SetLinks = (state, links) => {

  
  return ({
  ...state,
  links,
})
}

app({
  init: [
    {
      document: "",
      links: [],
    }
  ],

  subscriptions: state => [
    onSelectionChanged(state => { 
      runJSX("getActiveDoc.jsx", res => console.log(res))
      
      return state;
    }), 

    onLinksUpdate(SetLinks),
  ],

  node: document.querySelector("#app")
});

runJSX("getLinks.jsx", res => dispatchEventWithCSInterface('com.linkmanager2.updatedLinks', res));
