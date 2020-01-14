import React, { Component } from "react";
import {
  Drawer,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from "@material-ui/core";
import ChevroonLeftIcon from "@material-ui/icons/ChevronLeft";
import MenuIcon from "@material-ui/icons/Menu";
export class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  open = () => {
    this.setState({ open: true });
  };

  toggle = () => {
    this.setState({ open: !this.state.open });
  };

  render() {
    return (
      <div>
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" onClick={this.open} edge="start">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Bitcoin Prices
          </Typography>
        </Toolbar>
        <Drawer variant="persistent" anchor="left" open={this.state.open}>
          <div>
            <IconButton onClick={this.toggle}>
              <ChevroonLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <List>
            {["Table", "Graph"].map((text, index) => (
              <ListItem button key={text}>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
          <Divider />
        </Drawer>
      </div>
    );
  }
}
