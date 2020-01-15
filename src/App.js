import React from "react";
import "./App.scss";
import { BitcoinPrices } from "./BitcoinPrices/BitcoinPrices";
import { Navbar } from "./Navbar/Navbar";
import { Footer } from "./Footer/Footer";

function App() {
  return (
    <div className="App">
      <Navbar />
      <BitcoinPrices />
      <Footer />
    </div>
  );
}

export default App;
