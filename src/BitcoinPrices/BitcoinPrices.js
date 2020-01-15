import DateFnsUtils from "@date-io/date-fns";
import {
  Container,
  LinearProgress,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@material-ui/core";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import Plotly from "plotly.js-basic-dist";
import React, { Component } from "react";
import createPlotlyComponent from "react-plotly.js/factory";
import "./BitcoinPrices.scss";
const Plot = createPlotlyComponent(Plotly);

export class BitcoinPrices extends Component {
  constructor(props) {
    super(props);
    // gets currentDate, and one month before current date
    const currentDate = new Date();
    const prevDate = new Date();
    prevDate.setMonth(currentDate.getMonth() - 1);
    this.state = {
      currentPrice: "",
      prices: [],
      beginDate: prevDate,
      endDate: currentDate,
      loading: false,
      error: ""
    };
  }
  // when component mounts, current BTC price is retrieved
  // prices from the previous month until the current date are also retrieved
  componentDidMount = async () => {
    this.getCurrentPrice();
    this.getPricesFromDates(this.formatDateString(this.state.beginDate), this.formatDateString(this.state.endDate));
  };
  // returns a JSON object from a GET request
  // @param {string} url => a url to make an HTTP request to
  getResponseJSON = async url => {
    const response = await fetch(url);
    return response.json();
  };
  // retrieves the current BTC price from coindesk API
  getCurrentPrice = async () => {
    const response = await this.getResponseJSON("https://api.coindesk.com/v1/bpi/currentprice.json");
    const currentPrice = response.bpi.USD.rate;
    this.setState({ currentPrice: currentPrice });
  };
  // retrieves an array of average BTC prices everyday from the startDate to the endDate
  // @param {string} startDate => starting date to use as a query in the request
  // @param {string} endDate => end date to use as a query in the request
  getPricesFromDates = async (startDate, endDate) => {
    this.setState({ loading: true, progress: 0 });
    const response = await this.getResponseJSON(
      `https://api.coindesk.com/v1/bpi/historical/close.json?start=${startDate}&end=${endDate}`
    );
    for (const [date, price] of Object.entries(response.bpi)) {
      this.setState({ prices: [...this.state.prices, { date: date, price: price }] });
    }
    this.setState({ loading: false });
  };
  // formats a JS Date object into a readable string to insert into the API queries
  // @param {Date} date => a Date object to parse
  // returns a string in this format: "YYYY/MM/DD"
  formatDateString = date => {
    return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${
      date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
    }`;
  };
  // changes the date in the state when a user interacts with the date pickers
  // @param {Date} date => the date to update in the state
  // @param {string} type => either "beginDate" or "endDate", refers to the type of date to
  // manipulate in the state
  // function exits and sets an error if beginDate > endDate or if endDate < beginDate || current date
  handleDateChange = (date, type) => {
    this.setState({ error: "" });
    if (type === "beginDate" && date > this.state.endDate) {
      this.setState({ error: "Begin date cannot be greater than end date" });
      return;
    }
    if (type === "endDate") {
      if (date < this.state.beginDate) {
        this.setState({ error: "End date cannot be greater than begin date" });
        return;
      }
      const currentDate = new Date();
      if (date > currentDate) {
        this.setState({ error: "End date cannot be greater than current date" });
        return;
      }
    }
    this.setState({ [type]: date }, () => {
      this.setState({ prices: [] });
      const beginDateStr = this.formatDateString(this.state.beginDate);
      const endDateStr = this.formatDateString(this.state.endDate);
      this.getPricesFromDates(beginDateStr, endDateStr);
    });
  };
  render() {
    const { currentPrice, prices, beginDate, endDate, loading, error } = this.state;
    return (
      <div className="bitcoin_prices">
        <Container>
          <h1>Current Bitcoin Price: {currentPrice} USD</h1>
          <div className="date-pickers">
            <h2 className="date-pickers-header">View Daily Bitcoin Prices</h2>
            <div className="date-picker begin-date">
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                  label="Begin Date"
                  value={beginDate}
                  onChange={date => this.handleDateChange(date, "beginDate")}
                />
              </MuiPickersUtilsProvider>
            </div>
            <div className="date-picker end-date">
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={date => this.handleDateChange(date, "endDate")}
                />
              </MuiPickersUtilsProvider>
            </div>
          </div>
          <Snackbar anchorOrigin={{ vertical: "top", horizontal: "center" }} open={error !== ""} message={error} />
          {loading ? (
            <LinearProgress />
          ) : (
            !error && (
              <div key="not-loading">
                <Table aria-label="bitcoin table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Bitcoin Price (USD)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prices.map(row => (
                      <TableRow key={`${row.date}/${row.price}`}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Plot
                  data={[
                    {
                      x: prices.map(row => row.date),
                      y: prices.map(row => row.price),
                      type: "scatter",
                      mode: "lines",
                      marker: { color: "blue" }
                    }
                  ]}
                  useResizeHandler
                  style={{ width: "100%", height: "100%" }}
                  layout={{
                    autosize: true,
                    title: `Bitcoin Prices from ${this.formatDateString(beginDate)} to ${this.formatDateString(
                      endDate
                    )}`
                  }}
                />
              </div>
            )
          )}
        </Container>
      </div>
    );
  }
}
