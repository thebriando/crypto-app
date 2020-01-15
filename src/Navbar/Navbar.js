import { Toolbar, Typography } from "@material-ui/core";
import React from "react";
export const Navbar = () => {
    return (
      <div>
        <Toolbar>
          <Typography variant="h6" noWrap>
            Bitcoin Price Tracker
          </Typography>
        </Toolbar>
      </div>
    );
}
