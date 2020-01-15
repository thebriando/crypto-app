import DateFnsUtils from "@date-io/date-fns";
import { Container, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow } from "@material-ui/core";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import React, { Component } from "react";
import "./BitcoinPrices.scss";
import Plotly from "plotly.js-basic-dist";
import createPlotlyComponent from "react-plotly.js/factory";
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
      loading: false
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
  handleBeginDateChange = date => {
    this.setState({ beginDate: date }, () => {
      this.setState({ prices: [] });
      const beginDateStr = this.formatDateString(this.state.beginDate);
      const endDateStr = this.formatDateString(this.state.endDate);
      this.getPricesFromDates(beginDateStr, endDateStr);
    });
  };
  handleEndDateChange = date => {
    this.setState({ endDate: date }, () => {
      this.setState({ prices: [] });
      const beginDateStr = this.formatDateString(this.state.beginDate);
      const endDateStr = this.formatDateString(this.state.endDate);
      this.getPricesFromDates(beginDateStr, endDateStr);
    });
  };
  render() {
    const { currentPrice, prices, beginDate, endDate, loading } = this.state;
    return (
      <Container>
        <h1>Current Bitcoin Price: {currentPrice} USD</h1>
        <div className="date-pickers">
          <h2 className="date-pickers-header">View Daily Bitcoin Prices</h2>
          <div className="date-picker begin-date">
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DatePicker label="Begin Date" value={beginDate} onChange={date => this.handleBeginDateChange(date)} />
            </MuiPickersUtilsProvider>
          </div>
          <div className="date-picker end-date">
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DatePicker label="End Date" value={endDate} onChange={date => this.handleEndDateChange(date)} />
            </MuiPickersUtilsProvider>
          </div>
        </div>
        {loading ? (
          <LinearProgress />
        ) : (
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
                  marker: { color: "red" }
                }
              ]}
              useResizeHandler
              style={{ width: "100%", height: "100%" }}
              layout={{
                autosize: true,
                title: `Bitcoin Prices from ${this.formatDateString(beginDate)} to ${this.formatDateString(endDate)}`
              }}
            />
          </div>
        )}
      </Container>
    );
  }
}
