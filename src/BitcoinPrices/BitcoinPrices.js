import "./BitcoinPrices.scss";
import {
  Container,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Snackbar
} from "@material-ui/core";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import createPlotlyComponent from "react-plotly.js/factory";
import DateFnsUtils from "@date-io/date-fns";
import Plotly from "plotly.js-basic-dist";
import React, { Component } from "react";
const Plot = createPlotlyComponent(Plotly);

export class BitcoinPrices extends Component {
  constructor(props) {
    super(props);
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
  componentDidMount = async () => {
    this.getCurrentPrice();
  };
  getResponseJSON = async url => {
    const response = await fetch(url);
    return response.json();
  };
  getCurrentPrice = async () => {
    const response = await this.getResponseJSON("https://api.coindesk.com/v1/bpi/currentprice.json");
    const currentPrice = response.bpi.USD.rate;
    this.setState({ currentPrice: currentPrice });
  };
  getPricesFromDates = async (startDate, endDate) => {
    this.setState({ loading: true });
    const response = await this.getResponseJSON(
      `https://api.coindesk.com/v1/bpi/historical/close.json?start=${startDate}&end=${endDate}`
    );
    for (const [date, price] of Object.entries(response.bpi)) {
      this.setState({ prices: [...this.state.prices, { date: date, price: price }] });
    }
    this.setState({ loading: false });
  };
  componentWillMount() {
    this.getPricesFromDates(this.formatDateString(this.state.beginDate), this.formatDateString(this.state.endDate));
  }
  formatDateString = date => {
    return `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${
      date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
    }`;
  };
  handleDateChange = (date, type) => {
    this.setState({ error: "" });
    if (type === "beginDate" && date > this.state.endDate) {
      this.setState({ error: "Begin date cannot be greater than end date" });
      return;
    }
    if (type === "endDate" && date < this.state.beginDate) {
      this.setState({ error: "End date cannot be greater than begin date" });
      return;
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
              <div>
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
                      mode: "lines+markers",
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
