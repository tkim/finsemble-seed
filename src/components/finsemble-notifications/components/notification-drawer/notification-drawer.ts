import * as React from "react";
import * as ReactDom from "react-dom";
import App from "./App";
import { FSBL } from "../../types/FSBL-definitions/globals";

const FSBLReady = () => {
  try {
    // Do things with FSBL in here.
    ReactDom.render(<App />, document.getElementById("notifications-drawer"));
  } catch (e) {
    window.FSBL.Clients.Logger.error(e);
  }
};

if (window.FSBL && FSBL.addEventListener) {
  const FSBL = window.FSBL;
  FSBL.addEventListener("onReady", FSBLReady);
} else {
  window.addEventListener("FSBLReady", FSBLReady);
}
