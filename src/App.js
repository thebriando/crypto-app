import React from "react";
import logo from "./logo.svg";
import { Toolbar } from "@material-ui/core";
import { Sidebar } from "./Sidebar/Sidebar.js";
import { BitcoinPrices } from "./BitcoinPrices/BitcoinPrices";
import "./App.scss";

function App() {
  return (
    <div className="App">
      <Sidebar></Sidebar>
      <BitcoinPrices />
      <Toolbar>This data was produced from the CoinDesk Bitcoin Price Index. Non-USD currency data converted using hourly conversion rate from openexchangerates.org</Toolbar>
    </div>
  );
}

export default App;
