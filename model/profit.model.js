const mongoose = require("mongoose");

var schema = mongoose.Schema({
  profit: {
    type: Number,
  },
});

const profit = mongoose.model("profit", schema);
module.exports = profit;
