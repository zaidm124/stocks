const mongoose = require("mongoose");

var schema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  trade_typr: {
    type: String,
    required: true,
    enum: ["BUY", "SELL"],
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const stockModel = mongoose.model("Stock", schema);
module.exports = stockModel;
