import React, { Component } from "react";
import { Container, Table, TableHead, TableRow, TableBody, TableCell, CircularProgress } from "@material-ui/core";
import { DatePicker, KeyboardDatePicker, DateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

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
      // this.getPricesFromDates(this.state.beginDate, this.state.endDate);
    });
  };
  render() {
    return (
      <Container>
        <h1>Current Bitcoin Price: {this.state.currentPrice} USD</h1>
        <h2>View Daily Bitcoin Prices</h2>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <DatePicker value={this.state.beginDate} onChange={date => this.handleBeginDateChange(date)} />
        </MuiPickersUtilsProvider>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <DatePicker value={this.state.endDate} onChange={date => this.handleEndDateChange(date)} />
        </MuiPickersUtilsProvider>
        {this.state.loading ? (
          <CircularProgress />
        ) : (
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Bitcoin Price (USD)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.prices.map(row => (
                <TableRow key={row.date + row.price}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Container>
    );
  }
}
