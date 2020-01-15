import { Toolbar } from "@material-ui/core";
import React from "react";
import "./Footer.scss";

export const Footer = () => {
  return (
    <div className="footer">
      <Toolbar>
        <span className="footer-text">
          This data was produced from the CoinDesk Bitcoin Price Index. Non-USD currency data converted using hourly
          conversion rate from openexchangerates.org
        </span>
      </Toolbar>
    </div>
  );
};
