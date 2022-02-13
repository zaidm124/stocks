const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const stockModel = require("./model/stock.model");
const cors = require("cors");

const csv = require("csvtojson");
const bodyParser = require("body-parser");
const profitModel = require("./model/profit.model");

require("dotenv").config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

var uplaods = multer({ storage: storage });

const mongo_uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://zaidbh:123@cluster0.cfkyl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect(mongo_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Mongoose database connection established successfully");
});

const app = express();

app.use(express.json());

let corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));

const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "client/build")));

app.use(express.static(path.resolve(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.get("/trans", async (req, res) => {
  // res.sendFile(__dirname + "/index.html");
  const resp = await stockModel.find();
  //   console.log(resp);
  if (resp.length) {
    let avgPrice = 0;
    let total = 0;
    for (var i = 0; i < resp.length; i++) {
      const trans = resp[i];
      if (trans.trade_typr == "BUY") {
        avgPrice += trans.price * trans.quantity;
        total += trans.quantity;
      }
    }
    avgPrice = avgPrice / total;
    avgPrice = avgPrice.toFixed(4);
    let getProfit = await profitModel.find();
    const profit = getProfit[0].profit;
    // console.log(avgPrice);
    const transactions = await stockModel.find();
    res.json({ success: true, average: avgPrice, profit, trans: transactions });
  } else {
    res.json({ success: true, average: 0, profit: 0, trans: [] });
  }
});

app.post("/", uplaods.single("csv"), (req, res) => {
  csv()
    .fromFile(req.file.path)
    .then(async (jsonObj) => {
      const current = jsonObj[0];
      if (current.trade_typr == "SELL") {
        let profit = 0;
        const allTrans = await stockModel.find();
        const duplicate = await stockModel.findOne({ id: current.id });
        if (duplicate) {
          res.redirect("/");
          return;
        }
        if (!allTrans.length) {
          res.redirect("/");
          return;
        }
        let leftOver = current.quantity;
        for (let i = 0; i < allTrans.length; i++) {
          const trans = allTrans[i];
          if (trans.quantity > 0 && leftOver > 0) {
            let sell = 0;
            if (trans.quantity > leftOver) {
              sell = leftOver;
              profit += sell * (current.price - trans.price);
              leftOver = 0;
            } else {
              sell = trans.quantity;
              profit += sell * (current.price - trans.price);
              leftOver -= trans.quantity;
            }
            let toUpdate = await stockModel.findOne({ id: trans.id });
            toUpdate.quantity = trans.quantity - sell;
            await toUpdate.save();
          }
        }
        let getProfit = await profitModel.find();
        let toUpdateProfit = await profitModel.findOne({
          profit: getProfit[0].profit,
        });
        // console.log(toUpdateProfit);
        toUpdateProfit.profit += profit;
        await toUpdateProfit.save();
      }
      //   console.log(jsonObj);
      let stock = new stockModel({
        id: current.id,
        trade_typr: current.trade_typr,
        quantity: current.quantity,
        price: current.price,
      });
      await stock.save((err, doc, num) => {
        if (err) {
          console.log(err);
        }
      });
      res.redirect("/");
    });
});

app.delete("/reset", async (req, res) => {
  await stockModel.deleteMany();
  let getProfit = await profitModel.find();
  let toUpdate = await profitModel.findOne({
    profit: getProfit[0].profit,
  });
  toUpdate.profit = 0;
  await toUpdate.save();
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log("Connected to server at port 5000");
});
