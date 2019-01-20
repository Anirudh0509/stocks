import mongoose from 'mongoose';

let portfolioSchema = new mongoose.Schema({
  
  ticker : {
    type : String,
    required : true,
    minlength : 1,
    unique : true,
    default : null
  },
  avg_buy_price : {
    type : Number,
    required : true,
    default : 0
  },
  shares : {
    type : Number,
    required : true,
    default : 0,
    min : 0
  }

});

export default mongoose.model('portfolio', portfolioSchema);