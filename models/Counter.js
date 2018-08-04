const mongoose = require('mongoose')
const Schema= mongoose.Schema

const CounterSchema=new Schema({
  _id: String,
  seq: { type: Number, default: 0 },
}, {
  timestamps: true
})

module.exports = mongoose.model('counter',CounterSchema)
