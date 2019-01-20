import mongoose from 'mongoose';

let transactionSchema = new mongoose.Schema({
  
  transaction_detail : {
    type : String,
    required : true,
    default : null
  },
  ticker : {
    type : String,
    required : true,
    default : null
  },
  shares : {
    type : Number,
    required : true,
    default : 0
  },
  price : {
    type : Number,
    required : true,
    default : 0
  },
  status : {
    type : String,
    required : true
  },
  transaction_date : {
    type : Date,
    default : Date.now
  }

});

export default mongoose.model('transaction', transactionSchema);