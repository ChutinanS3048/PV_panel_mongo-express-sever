const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productsSchema = new Schema({
  nameBoard: String,
  volts: [Number],
  current: [Number],
  light_intensity: Number,
  processStatus: Number,
  myDateTime: String,
  status_Save : String

})

const ProductsModel = mongoose.model('Products', productsSchema)

module.exports = ProductsModel