import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [profit, setProfit] = useState(0);
  const [average, setAverage] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const getData = () => {
    axios.get("/trans", {}).then((res) => {
      console.log(res.data);
      if (res.data.success) {
        setAverage(res.data.average);
        setProfit(res.data.profit);
        setTransactions(res.data.trans);
      }
    });
  };

  useEffect(() => {
    getData();
  });

  const reset = () => {
    axios.delete("/reset", {}).then((res) => {
      getData();
      console.log(res);
    });
  };

  return (
    <div className="app">
      <div className="center">Average Price and profit of Stocks</div>
      <div className="row">
        <div className="font padding">Total Profit: {profit} </div>
        <div className="right font padding">
          Current Average Price: {average}{" "}
        </div>
      </div>
      <div className="row">
        <div>
          <form method="post" action="/" enctype="multipart/form-data">
            <input className="cursor" required type="file" name="csv"></input>
            <button className="cursor" type="submit">Submit</button>
          </form>
        </div>
        <div>
          <button className="red" onClick={reset}>
            RESET
          </button>
        </div>
      </div>
      <div className="padding ">
        <div className="center green font">Total Transactions</div>
        <div className="column">
          <div className="row">
            <div className="font color space">ID</div>
            <div className="font color space">TRADE_TYPE</div>
            <div className="font color space">QUANTITY</div>
            <div className="font color space">PRICE</div>
          </div>

          {transactions.map((trans) => {
            return (
              <div className="row">
                <div className="font space">{trans.id}</div>
                <div className="font space">{trans.trade_typr}</div>
                <div className="font space">{trans.quantity}</div>
                <div className="font space">{trans.price}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
